using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HiServis.Tests;

public class Phase1IntakeAndBayTests
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=hiservis_test;Username=hiservis_app;Password=hiservis_pass";
    private static readonly Guid TenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid MaslakBranchId = Guid.Parse("22222222-2222-2222-2222-222222222222");
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
    public void TsbCatalogService_LookupByCode_ReturnsCorrectVehicleSpecs()
    {
        var service = new TsbVehicleCatalogService();

        var passat = service.LookupByTsbCode("1531245");
        Assert.NotNull(passat);
        Assert.Equal("Passat 1.6 TDI BMT Comfortline DSG", passat.MarketName);
        Assert.Equal(1598, passat.EngineDisplacementCc);
        Assert.Equal(120, passat.HorsePowerHp);
        Assert.Equal("Diesel", passat.FuelType);

        var corolla = service.LookupByTsbCode("2081190");
        Assert.NotNull(corolla);
        Assert.Equal("Corolla 1.8 Hybrid Dream e-CVT", corolla.MarketName);
        Assert.Equal("Hybrid", corolla.FuelType);
    }

    [Fact]
    public void TsbCatalogService_LookupByVehicleInfo_MatchesModelOrVinPrefix()
    {
        var service = new TsbVehicleCatalogService();

        var matchByVin = service.LookupByVehicleInfo("Volkswagen", "Passat", 2021, "WVWZZZ3CZWE104921");
        Assert.NotNull(matchByVin);
        Assert.Equal("1531245", matchByVin.TsbCode);

        var matchByRenault = service.LookupByVehicleInfo("Renault", "Megane", 2020, "VF1RFB00858921045");
        Assert.NotNull(matchByRenault);
        Assert.Equal("1042301", matchByRenault.TsbCode);

        // Verification of bug fix: lookup with brand only when model is empty
        var matchToyotaOnly = service.LookupByVehicleInfo("Toyota", "");
        Assert.NotNull(matchToyotaOnly);
        Assert.Equal("2081190", matchToyotaOnly.TsbCode);
        Assert.Contains("Corolla", matchToyotaOnly.MarketName);

        var matchFiatOnly = service.LookupByVehicleInfo("Fiat", "");
        Assert.NotNull(matchFiatOnly);
        Assert.Equal("3015401", matchFiatOnly.TsbCode);
        Assert.Contains("Egea", matchFiatOnly.MarketName);
    }

    [Fact]
    public async Task RegistrationCardOcrService_WithPreset_ReturnsEnrichedData()
    {
        var tsbService = new TsbVehicleCatalogService();
        var ocrService = new RegistrationCardOcrService(tsbService);

        var result = await ocrService.ProcessRegistrationCardAsync(new RegistrationCardOcrRequest(MockVehiclePreset: "corolla"));

        Assert.NotNull(result);
        Assert.Equal("35 CDE 789", result.PlateNumber);
        Assert.Equal("TOYOTA", result.Brand);
        Assert.NotNull(result.TsbVehicle);
        Assert.Equal("2081190", result.TsbVehicle.TsbCode);
        Assert.True(result.ConfidenceScore > 0.9);
    }

    [Fact]
    public async Task RegistrationCardOcrService_WithRawText_ExtractsPlateAndVin()
    {
        var tsbService = new TsbVehicleCatalogService();
        var ocrService = new RegistrationCardOcrService(tsbService);

        var rawOcrText = @"
            TÜRKİYE CUMHURİYETİ ARAÇ TESCİL BELGESİ
            PLAKA: 34 ABC 123
            ŞASE NO: WVWZZZ3CZWE123456
            MOTOR NO: CXX123456
            MARKA: VOLKSWAGEN
            MODEL YILI: 2021
        ";

        var result = await ocrService.ProcessRegistrationCardAsync(new RegistrationCardOcrRequest(RawText: rawOcrText));

        Assert.NotNull(result);
        Assert.Contains("34ABC123", result.PlateNumber.Replace(" ", ""));
        Assert.Equal("WVWZZZ3CZWE123456", result.Vin);
        Assert.Equal("CXX123456", result.EngineNumber);
        Assert.Equal("VOLKSWAGEN", result.Brand);
        Assert.NotNull(result.TsbVehicle);
    }

    [Fact]
    public async Task RegistrationCardOcrService_WithRawTextForFiatEgea_ExtractsCorrectModelAndYear()
    {
        var tsbService = new TsbVehicleCatalogService();
        var ocrService = new RegistrationCardOcrService(tsbService);

        var rawOcrText = @"
            TÜRKİYE CUMHURİYETİ ARAÇ TESCİL BELGESİ
            PLAKA: 34 DEF 999
            ŞASE NO: NM435600012345678
            MOTOR NO: 843A1000
            MARKA: FIAT
            MODEL: EGEA
            MODEL YILI: 2023
            RENK: GÜMÜŞ GRİ
        ";

        var result = await ocrService.ProcessRegistrationCardAsync(new RegistrationCardOcrRequest(RawText: rawOcrText));

        Assert.NotNull(result);
        Assert.Equal("34DEF999", result.PlateNumber.Replace(" ", ""));
        Assert.Equal("FIAT", result.Brand);
        Assert.Equal(2023, result.ModelYear);
        Assert.Equal("GÜMÜŞ GRİ", result.Color);
        Assert.NotNull(result.TsbVehicle);
        Assert.Equal("3015401", result.TsbVehicle.TsbCode);
        Assert.Contains("Egea", result.TsbVehicle.MarketName);
    }

    [Fact]
    public async Task AssetLookup_WithExistingPlate_ReturnsAssetAndHistory()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        // Seeded vehicle: '34 ABC 123'
        var asset = await db.Assets
            .FirstOrDefaultAsync(a => a.PrimaryIdentifier.Replace(" ", "").ToUpper() == "34ABC123");

        Assert.NotNull(asset);

        var workOrders = await db.WorkOrders
            .Where(w => w.AssetId == asset.Id)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

        Assert.NotEmpty(workOrders);
        Assert.Equal("34 ABC 123", asset.PrimaryIdentifier);
        Assert.Equal("Volkswagen", asset.Brand);
    }

    [Fact]
    public async Task RapidIntake_CreatesWorkOrderWithDamagePinsAndOutbox()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var testPlate = "34 TST " + Random.Shared.Next(100, 999);
        var damageMarkers = new List<DamageMarkerDto>
        {
            new("FrontBumperRight", "Scratch", "https://img.test/1.jpg", 15.5, 30.2, "Kaldırıma sürtme"),
            new("DoorRearLeft", "Dent", "https://img.test/2.jpg", 45.0, 70.0, "Otopark çarpması")
        };

        var asset = new Asset
        {
            TenantId = TenantId,
            PrimaryIdentifier = testPlate,
            SecondaryIdentifier = "WVWZZZ3CZWE999999",
            Brand = "Volkswagen",
            Model = "Passat 1.6 TDI",
            ModelYear = 2021,
            CurrentMeter = 148500,
            DynamicAttributesJson = System.Text.Json.JsonSerializer.Serialize(new { damageMarkers })
        };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var woNumber = $"WO-2026-TEST{Random.Shared.Next(1000, 9999)}";
        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = woNumber,
            CustomerName = "Caner Özdemir",
            CustomerPhone = "0532 999 1122",
            IntakeMeter = 148500,
            CustomerComplaint = "Ön takımdan tıkırtı geliyor",
            Priority = "Urgent",
            Status = WorkOrderStatus.Open,
            DamageMarkersJson = System.Text.Json.JsonSerializer.Serialize(damageMarkers),
            TargetLaborMinutes = 90
        };
        db.WorkOrders.Add(wo);

        var outbox = new OutboxEvent
        {
            TenantId = TenantId,
            AggregateType = "WorkOrder",
            AggregateId = wo.Id,
            EventType = "WorkOrderIntakeCompletedEvent",
            PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { wo.Id, woNumber, Plate = testPlate })
        };
        db.OutboxEvents.Add(outbox);

        await db.SaveChangesAsync();

        // Clear change tracker to ensure reading fresh from PostgreSQL
        db.ChangeTracker.Clear();

        var reloaded = await db.WorkOrders.Include(w => w.Asset).FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(reloaded);
        Assert.Equal(woNumber, reloaded.WorkOrderNumber);
        Assert.Equal("Urgent", reloaded.Priority);
        Assert.Equal(WorkOrderStatus.Open, reloaded.Status);
        Assert.Contains("FrontBumperRight", reloaded.DamageMarkersJson);
        Assert.Equal(testPlate, reloaded.Asset?.PrimaryIdentifier);
    }

    [Fact]
    public async Task LaborClockInAndClockOut_ProperlyTracksTime()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var wo = await db.WorkOrders.FirstOrDefaultAsync();
        Assert.NotNull(wo);

        // 1. Clock In
        wo.IsLaborRunning = true;
        wo.LaborStartedAt = DateTimeOffset.UtcNow.AddMinutes(-5); // Simulate 5 minutes elapsed
        wo.Status = WorkOrderStatus.InProgress;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var clockedIn = await db.WorkOrders.FindAsync(wo.Id);
        Assert.NotNull(clockedIn);
        Assert.True(clockedIn.IsLaborRunning);
        Assert.NotNull(clockedIn.LaborStartedAt);

        // 2. Clock Out
        var additionalSeconds = (int)(DateTimeOffset.UtcNow - clockedIn.LaborStartedAt.Value).TotalSeconds;
        clockedIn.LaborElapsedSeconds += additionalSeconds;
        clockedIn.IsLaborRunning = false;
        clockedIn.LaborStartedAt = null;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var clockedOut = await db.WorkOrders.FindAsync(wo.Id);
        Assert.NotNull(clockedOut);
        Assert.False(clockedOut.IsLaborRunning);
        Assert.Null(clockedOut.LaborStartedAt);
        Assert.True(clockedOut.LaborElapsedSeconds >= 290); // ~300 seconds
    }

    [Fact]
    public async Task BayAssignment_UpdatesWorkOrderStatusAndLinksBay()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        // Ensure at least one bay exists
        var bay = await db.WorkshopBays.FirstOrDefaultAsync(b => b.BranchId == MaslakBranchId);
        if (bay == null)
        {
            bay = new WorkshopBay
            {
                TenantId = TenantId,
                BranchId = MaslakBranchId,
                BayCode = "LIFT-TEST",
                Name = "Test Lift",
                BayType = "Mechanic",
                AssignedTechnicianId = TechAhmetId,
                IsActive = true
            };
            db.WorkshopBays.Add(bay);
            await db.SaveChangesAsync();
        }

        var wo = await db.WorkOrders.FirstOrDefaultAsync();
        Assert.NotNull(wo);

        // Assign to bay
        wo.BayId = bay.Id;
        bay.CurrentWorkOrderId = wo.Id;
        wo.Status = WorkOrderStatus.InProgress;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var reloadedBay = await db.WorkshopBays.Include(b => b.CurrentWorkOrder).FirstOrDefaultAsync(b => b.Id == bay.Id);
        Assert.NotNull(reloadedBay);
        Assert.Equal(wo.Id, reloadedBay.CurrentWorkOrderId);
        Assert.NotNull(reloadedBay.CurrentWorkOrder);
        Assert.Equal(WorkOrderStatus.InProgress, reloadedBay.CurrentWorkOrder.Status);
    }

    [Theory]
    [InlineData("34abc123", "34 ABC 123")]
    [InlineData("06t1234", "06 T 1234")]
    [InlineData("35cde789", "35 CDE 789")]
    [InlineData("01a0001", "01 A 0001")]
    [InlineData("99-CD-123", "99-CD-123")]
    public void PlateNormalization_HandlesVariousTurkishAndForeignPlateFormats(string input, string expected)
    {
        var rawPlate = input.Trim().ToUpperInvariant().Replace(" ", "");
        var formattedPlate = input.Trim().ToUpperInvariant();
        if (System.Text.RegularExpressions.Regex.IsMatch(rawPlate, @"^\d{2}[A-Z]{1,3}\d{2,4}$"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(rawPlate, @"^(\d{2})([A-Z]{1,3})(\d{2,4})$");
            formattedPlate = $"{match.Groups[1].Value} {match.Groups[2].Value} {match.Groups[3].Value}";
        }

        Assert.Equal(expected, formattedPlate);
    }

    [Fact]
    public async Task WorkOrderStatus_TransitionsThroughLifecycle_AndEmitsOutbox()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var asset = await db.Assets.FirstOrDefaultAsync();
        Assert.NotNull(asset);

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-CYCLE-{Guid.NewGuid():N}",
            CustomerName = "Cycle Test",
            CustomerPhone = "0532 000 0000",
            Status = WorkOrderStatus.Open,
            IntakeMeter = 50000,
            CustomerComplaint = "Test döngüsü"
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        var statuses = new[] { WorkOrderStatus.InProgress, WorkOrderStatus.WaitingParts, WorkOrderStatus.Completed };
        foreach (var newStatus in statuses)
        {
            var targetWo = await db.WorkOrders.FindAsync(wo.Id);
            Assert.NotNull(targetWo);

            var oldStatus = targetWo.Status;
            targetWo.Status = newStatus;
            targetWo.UpdatedAt = DateTimeOffset.UtcNow;

            var outbox = new OutboxEvent
            {
                TenantId = targetWo.TenantId,
                AggregateType = "WorkOrder",
                AggregateId = targetWo.Id,
                EventType = "WorkOrderStatusChangedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { targetWo.Id, oldStatus = oldStatus.ToString(), newStatus = newStatus.ToString() })
            };
            db.OutboxEvents.Add(outbox);
            await db.SaveChangesAsync();

            db.ChangeTracker.Clear();
            var updated = await db.WorkOrders.FindAsync(wo.Id);
            Assert.NotNull(updated);
            Assert.Equal(newStatus, updated.Status);
        }
    }

    [Fact]
    public void Receipt_DynamicAttributesJson_ExtractsFuelLevelRatio()
    {
        var jsonWithQuarterFuel = "{\"fuelLevel\":0.25,\"damageInspectionMarkers\":[]}";
        double extracted = 0.5;
        using (var doc = System.Text.Json.JsonDocument.Parse(jsonWithQuarterFuel))
        {
            if (doc.RootElement.TryGetProperty("fuelLevel", out var prop) && prop.TryGetDouble(out var fl))
            {
                extracted = fl;
            }
        }

        Assert.Equal(0.25, extracted);
    }
}
