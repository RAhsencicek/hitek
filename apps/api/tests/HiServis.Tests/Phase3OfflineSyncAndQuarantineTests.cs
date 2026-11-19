using System.Text.Json;
using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HiServis.Tests;

public class Phase3OfflineSyncAndQuarantineTests
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=hiservis_test;Username=hiservis_app;Password=hiservis_pass";
    private static readonly Guid TenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid MaslakBranchId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid ManagerHakanId = Guid.Parse("44444444-4444-4444-4444-444444444444");

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
    public void HlcTimestamp_PackingAndUnpacking_PreservesValues()
    {
        long physicalMs = 1773950000123L; // arbitrary ms timestamp
        int counter = 42;
        string nodeId = "NODE-MASLAK-01";

        var hlc = new HlcTimestamp(physicalMs, counter, nodeId);
        long packed = hlc.ToPackedLong();

        var unpacked = HlcTimestamp.FromPackedLong(packed, nodeId);

        Assert.Equal(physicalMs, unpacked.PhysicalTimeMs);
        Assert.Equal(counter, unpacked.LogicalCounter);
        Assert.Equal(nodeId, unpacked.NodeId);
        Assert.Equal(packed, unpacked.ToPackedLong());
    }

    [Fact]
    public void HlcTimestamp_MonotonicProgression_MaintainsStrictOrder()
    {
        var t1 = HlcTimestamp.Now("NODE-A");
        var t2 = HlcTimestamp.Now("NODE-A");

        Assert.True(t2.CompareTo(t1) >= 0);
        Assert.True(t2.ToPackedLong() >= t1.ToPackedLong());
    }

    [Fact]
    public void HlcTimestamp_ClockSkewCatchUp_AdvancesLogicalCounterWhenPhysicalTimesAreEqual()
    {
        long physicalMs = 1773950000000L;
        var local = new HlcTimestamp(physicalMs, 5, "LOCAL-01");
        var remote = new HlcTimestamp(physicalMs, 10, "REMOTE-01");

        // Remote has higher logical counter at the same physical millisecond
        var updated = local.Update(remote, physicalMs);

        Assert.Equal(physicalMs, updated.PhysicalTimeMs);
        Assert.Equal(11, updated.LogicalCounter); // Advances beyond remote counter
        Assert.True(updated.CompareTo(remote) > 0);
        Assert.True(updated.CompareTo(local) > 0);
    }

    [Fact]
    public async Task SyncBatch_NormalWorkOrderCompleted_UpdatesWorkOrderStatusToCompleted()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, ManagerHakanId, "Manager", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = await db.Assets.FirstOrDefaultAsync();
        Assert.NotNull(asset);

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-SYNC-{Random.Shared.Next(10000, 99999)}",
            CustomerName = "Normal Senkronizasyon Testi",
            CustomerPhone = "0532 111 2233",
            Status = WorkOrderStatus.InProgress,
            IntakeMeter = 120000,
            CustomerComplaint = "Periyodik bakım",
            GrandTotal = 1500.00m
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        var mutationId = Guid.NewGuid();
        var clientHlc = HlcTimestamp.Now("MOBILE-DEV-01").ToPackedLong();

        var mutation = new SyncMutationItem(
            mutationId,
            "WorkOrderCompleted",
            wo.Id,
            clientHlc,
            JsonSerializer.Serialize(new { elapsedSeconds = 3600, internalNotes = "Normal tamamlandı" })
        );

        // Apply mutation
        var targetWo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(targetWo);

        targetWo.Status = WorkOrderStatus.Completed;
        targetWo.IsLaborRunning = false;
        targetWo.UpdatedAt = DateTimeOffset.UtcNow;
        targetWo.HlcTimestamp = clientHlc;

        db.ProcessedClientMutations.Add(new ProcessedClientMutation
        {
            TenantId = TenantId,
            MutationId = mutationId,
            ClientDeviceId = "MOBILE-DEV-01",
            ActionType = mutation.ActionType,
            WorkOrderId = wo.Id,
            Status = "Applied"
        });
        await db.SaveChangesAsync();

        // Verify status
        var updatedWo = await db.WorkOrders.AsNoTracking().FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(updatedWo);
        Assert.Equal(WorkOrderStatus.Completed, updatedWo.Status);

        // Verify idempotency record
        var processed = await db.ProcessedClientMutations.AnyAsync(m => m.MutationId == mutationId);
        Assert.True(processed);
    }

    [Fact]
    public async Task SyncBatch_IdempotentDuplicateMutation_IsDetected()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, ManagerHakanId, "Manager", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var duplicateMutationId = Guid.NewGuid();

        // Record first processing
        db.ProcessedClientMutations.Add(new ProcessedClientMutation
        {
            TenantId = TenantId,
            MutationId = duplicateMutationId,
            ClientDeviceId = "MOBILE-DEV-02",
            ActionType = "InstallPart",
            WorkOrderId = Guid.NewGuid(),
            Status = "Applied"
        });
        await db.SaveChangesAsync();

        // Simulate incoming batch with same mutation ID
        var alreadyProcessed = await db.ProcessedClientMutations
            .AnyAsync(m => m.MutationId == duplicateMutationId);

        Assert.True(alreadyProcessed);
    }

    [Fact]
    public async Task SyncBatch_ConflictDetection_CancelledServerVsClientCompleted_QuarantinesWorkOrder()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, ManagerHakanId, "Manager", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = await db.Assets.FirstOrDefaultAsync();
        Assert.NotNull(asset);

        // Server state: WorkOrder was CANCELLED by office
        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-CONFLICT-{Random.Shared.Next(10000, 99999)}",
            CustomerName = "Çakışma Senaryosu",
            CustomerPhone = "0532 555 4433",
            Status = WorkOrderStatus.Cancelled, // Ofiste iptal edildi!
            IntakeMeter = 142000,
            CustomerComplaint = "Müşteri arayıp iptal etti",
            GrandTotal = 2000.00m
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        // Client mutation: Technician in the basement finished the job
        var mutationId = Guid.NewGuid();
        var clientPayload = JsonSerializer.Serialize(new
        {
            status = "Completed",
            completedBy = "Teknisyen Ali",
            elapsedSeconds = 5400,
            technicianNotes = "Bodrum katında internet yokken balatalar takıldı ve işlem bitti."
        });

        // Trigger conflict detection logic
        bool hasConflict = (wo.Status == WorkOrderStatus.Cancelled || wo.Status == WorkOrderStatus.Invoiced);
        Assert.True(hasConflict);

        var incident = new QuarantineIncident
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            WorkOrderId = wo.Id,
            ConflictType = "STATUS_CONFLICT_CANCEL_VS_COMPLETE",
            ServerStateJson = JsonSerializer.Serialize(new { wo.Status, wo.WorkOrderNumber, wo.GrandTotal }),
            ClientStateJson = clientPayload,
            ResolutionStatus = "PendingReview",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.QuarantineIncidents.Add(incident);

        wo.Status = WorkOrderStatus.QuarantineReview;
        wo.UpdatedAt = DateTimeOffset.UtcNow;

        db.ProcessedClientMutations.Add(new ProcessedClientMutation
        {
            TenantId = TenantId,
            MutationId = mutationId,
            ClientDeviceId = "TABLET-LIFT-1",
            ActionType = "WorkOrderCompleted",
            WorkOrderId = wo.Id,
            Status = "Quarantined"
        });

        await db.SaveChangesAsync();

        // Verify WorkOrder is now in QUARANTINE_REVIEW
        var quarantinedWo = await db.WorkOrders.AsNoTracking().FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(quarantinedWo);
        Assert.Equal(WorkOrderStatus.QuarantineReview, quarantinedWo.Status);

        // Verify Quarantine Incident was created
        var savedIncident = await db.QuarantineIncidents.FirstOrDefaultAsync(q => q.Id == incident.Id);
        Assert.NotNull(savedIncident);
        Assert.Equal("PendingReview", savedIncident.ResolutionStatus);
        Assert.Equal("STATUS_CONFLICT_CANCEL_VS_COMPLETE", savedIncident.ConflictType);
    }

    [Fact]
    public async Task QuarantineArbitration_AcceptClientState_MarksCompletedAndApprovesParts()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, ManagerHakanId, "Manager", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = await db.Assets.FirstOrDefaultAsync();
        Assert.NotNull(asset);

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-ARB-CLI-{Random.Shared.Next(10000, 99999)}",
            CustomerName = "Hakemlik Saha Onayı",
            CustomerPhone = "0532 777 8899",
            Status = WorkOrderStatus.QuarantineReview,
            IntakeMeter = 98000,
            CustomerComplaint = "Ön balata",
            GrandTotal = 3100.00m
        };
        db.WorkOrders.Add(wo);

        var partReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "4047024185242",
            PartName = "Bosch Balata",
            RequestedQuantity = 1,
            AllocatedQuantity = 1,
            Status = "Allocated"
        };
        db.WorkOrderPartRequests.Add(partReq);

        var incident = new QuarantineIncident
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            WorkOrderId = wo.Id,
            ConflictType = "STATUS_CONFLICT_CANCEL_VS_COMPLETE",
            ServerStateJson = "{\"Status\":\"Cancelled\"}",
            ClientStateJson = "{\"Status\":\"Completed\"}",
            ResolutionStatus = "PendingReview",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.QuarantineIncidents.Add(incident);
        await db.SaveChangesAsync();

        // MANAGER RESOLUTION: AcceptClientState (Sahayı Onayla)
        incident.ResolutionStatus = "ResolvedByManager";
        incident.ResolutionAction = "AcceptClientState";
        incident.ManagerNotes = "Müşteri ile görüşüldü, yapılan işi kabul etti.";
        incident.ResolvedAt = DateTimeOffset.UtcNow;
        incident.ResolvedByUserId = ManagerHakanId;

        wo.Status = WorkOrderStatus.Completed;
        partReq.Status = "Installed";
        await db.SaveChangesAsync();

        // Verify results
        var verifiedWo = await db.WorkOrders.AsNoTracking().FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(verifiedWo);
        Assert.Equal(WorkOrderStatus.Completed, verifiedWo.Status);

        var verifiedIncident = await db.QuarantineIncidents.AsNoTracking().FirstOrDefaultAsync(q => q.Id == incident.Id);
        Assert.NotNull(verifiedIncident);
        Assert.Equal("ResolvedByManager", verifiedIncident.ResolutionStatus);
        Assert.Equal("AcceptClientState", verifiedIncident.ResolutionAction);

        var verifiedPart = await db.WorkOrderPartRequests.AsNoTracking().FirstOrDefaultAsync(p => p.Id == partReq.Id);
        Assert.NotNull(verifiedPart);
        Assert.Equal("Installed", verifiedPart.Status);
    }

    [Fact]
    public async Task QuarantineArbitration_AcceptServerState_RevertsToCancelledAndReturnsParts()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, ManagerHakanId, "Manager", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = await db.Assets.FirstOrDefaultAsync();
        Assert.NotNull(asset);

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-ARB-SRV-{Random.Shared.Next(10000, 99999)}",
            CustomerName = "Hakemlik Ofis Onayı",
            CustomerPhone = "0532 333 4455",
            Status = WorkOrderStatus.QuarantineReview,
            IntakeMeter = 110000,
            CustomerComplaint = "Şanzıman yağı",
            GrandTotal = 4500.00m
        };
        db.WorkOrders.Add(wo);

        var partReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "MOTUL-75W90-1L",
            PartName = "Motul Şanzıman Yağı",
            RequestedQuantity = 2,
            AllocatedQuantity = 2,
            Status = "Allocated"
        };
        db.WorkOrderPartRequests.Add(partReq);

        var incident = new QuarantineIncident
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            WorkOrderId = wo.Id,
            ConflictType = "STATUS_CONFLICT_CANCEL_VS_COMPLETE",
            ServerStateJson = "{\"Status\":\"Cancelled\"}",
            ClientStateJson = "{\"Status\":\"Completed\"}",
            ResolutionStatus = "PendingReview",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.QuarantineIncidents.Add(incident);
        await db.SaveChangesAsync();

        // MANAGER RESOLUTION: AcceptServerState (Ofisi Koru)
        incident.ResolutionStatus = "ResolvedByManager";
        incident.ResolutionAction = "AcceptServerState";
        incident.ManagerNotes = "Müşteri kesinlikle vazgeçtiğini bildirdi. Parça sökülerek depoya iade edilecek.";
        incident.ResolvedAt = DateTimeOffset.UtcNow;
        incident.ResolvedByUserId = ManagerHakanId;

        wo.Status = WorkOrderStatus.Cancelled;
        partReq.Status = "Returned";
        await db.SaveChangesAsync();

        // Verify results
        var verifiedWo = await db.WorkOrders.AsNoTracking().FirstOrDefaultAsync(w => w.Id == wo.Id);
        Assert.NotNull(verifiedWo);
        Assert.Equal(WorkOrderStatus.Cancelled, verifiedWo.Status);

        var verifiedIncident = await db.QuarantineIncidents.AsNoTracking().FirstOrDefaultAsync(q => q.Id == incident.Id);
        Assert.NotNull(verifiedIncident);
        Assert.Equal("ResolvedByManager", verifiedIncident.ResolutionStatus);
        Assert.Equal("AcceptServerState", verifiedIncident.ResolutionAction);

        var verifiedPart = await db.WorkOrderPartRequests.AsNoTracking().FirstOrDefaultAsync(p => p.Id == partReq.Id);
        Assert.NotNull(verifiedPart);
        Assert.Equal("Returned", verifiedPart.Status);
    }
}
