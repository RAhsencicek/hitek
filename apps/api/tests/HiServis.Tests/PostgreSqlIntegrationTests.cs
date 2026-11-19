using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace HiServis.Tests;

public class PostgreSqlIntegrationTests
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=hiservis_test;Username=hiservis_app;Password=hiservis_pass";

    private static readonly Guid TenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid MaslakBranchId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid BostanciBranchId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid TechAhmetId = Guid.Parse("55555555-5555-5555-5555-555555555555");

    private HiServisDbContext CreateDbContext(TenantContext tenantContext)
    {
        var interceptor = new PostgreSqlRlsInterceptor(tenantContext);
        var options = new DbContextOptionsBuilder<HiServisDbContext>()
            .UseNpgsql(ConnectionString)
            .AddInterceptors(interceptor)
            .Options;

        return new HiServisDbContext(options, tenantContext);
    }

    [Fact]
    public async Task QueryWorkOrders_WithMatchingTenantAndBranch_ReturnsWorkOrders()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var workOrders = await db.WorkOrders.Include(w => w.Asset).ToListAsync();

        Assert.NotEmpty(workOrders);
        Assert.All(workOrders, wo =>
        {
            Assert.Equal(TenantId, wo.TenantId);
            Assert.Equal(MaslakBranchId, wo.BranchId);
        });
    }

    [Fact]
    public async Task QueryWorkOrders_WithDifferentTenant_ReturnsZeroRows()
    {
        var context = new TenantContext();
        var alienTenantId = Guid.NewGuid();
        context.SetContext(alienTenantId, MaslakBranchId, null, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var workOrders = await db.WorkOrders.ToListAsync();

        Assert.Empty(workOrders);
    }

    [Fact]
    public async Task QueryWorkOrders_WithDifferentBranch_NonAdmin_ReturnsZeroRows()
    {
        var context = new TenantContext();
        // Technician from Bostanci branch trying to access Maslak's work orders
        context.SetContext(TenantId, BostanciBranchId, null, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var workOrders = await db.WorkOrders.ToListAsync();

        Assert.Empty(workOrders);
    }

    [Fact]
    public async Task QueryWorkOrders_WithDifferentBranch_TenantAdmin_ReturnsWorkOrders()
    {
        var context = new TenantContext();
        // Owner/Admin of tenant visiting Bostanci branch can see Maslak work orders via admin bypass
        context.SetContext(TenantId, BostanciBranchId, null, "Owner", isTenantAdmin: true);

        await using var db = CreateDbContext(context);

        var workOrders = await db.WorkOrders.ToListAsync();

        Assert.NotEmpty(workOrders);
    }

    [Fact]
    public async Task QueryWorkOrders_WithoutSessionContext_ReturnsZeroRows()
    {
        var context = new TenantContext(); // Unauthenticated, empty context

        await using var db = CreateDbContext(context);

        var workOrders = await db.WorkOrders.ToListAsync();

        Assert.Empty(workOrders);
    }

    [Fact]
    public async Task PinAuth_WithSeedUser_ShouldAuthenticateSuccessfully()
    {
        var context = new TenantContext();
        await using var db = CreateDbContext(context);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "HiServis_Integration_Test_Secret_Key_For_Jwt_Auth_2026_Long_Enough!",
                ["Jwt:Issuer"] = "HiServis.Api",
                ["Jwt:Audience"] = "HiServis.Clients"
            })
            .Build();

        var authService = new PinAuthService(db, config);

        var loginResult = await authService.LoginWithPinAsync(new PinLoginRequest("0533 200 3040", "1234"));

        Assert.True(loginResult.Success);
        Assert.NotNull(loginResult.Token);
        Assert.Equal("Ahmet Usta", loginResult.FullName);
        Assert.Equal(TenantId, loginResult.TenantId);
        Assert.Equal(MaslakBranchId, loginResult.BranchId);
        Assert.Equal("Technician", loginResult.Role);
    }

    [Fact]
    public async Task PinAuth_WithWrongPin_ShouldFail()
    {
        var context = new TenantContext();
        await using var db = CreateDbContext(context);

        var config = new ConfigurationBuilder().Build();
        var authService = new PinAuthService(db, config);

        var loginResult = await authService.LoginWithPinAsync(new PinLoginRequest("0533 200 3040", "9999"));

        Assert.False(loginResult.Success);
        Assert.Null(loginResult.Token);
        Assert.Equal("Hatalı PIN kodu.", loginResult.ErrorMessage);
    }

    [Fact]
    public async Task WorkOrder_StatusQuarantineReview_RoundTripPersistsQuarantineReview()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var wo = await db.WorkOrders.FirstOrDefaultAsync();
        Assert.NotNull(wo);

        var originalStatus = wo.Status;
        try
        {
            wo.Status = WorkOrderStatus.QuarantineReview;
            await db.SaveChangesAsync();

            // Clear change tracker to force reload from PostgreSQL
            db.ChangeTracker.Clear();

            var reloaded = await db.WorkOrders.FindAsync(wo.Id);
            Assert.NotNull(reloaded);
            Assert.Equal(WorkOrderStatus.QuarantineReview, reloaded.Status);

            // Verify raw SQL string in PostgreSQL via EF Core's managed SqlQuery
            var rawStatus = await db.Database
                .SqlQuery<string>($"SELECT status AS \"Value\" FROM workorders WHERE id = {wo.Id}")
                .FirstOrDefaultAsync();
            Assert.Equal("QUARANTINE_REVIEW", rawStatus);
        }
        finally
        {
            // Reset back
            wo.Status = originalStatus;
            await db.SaveChangesAsync();
        }
    }
}
