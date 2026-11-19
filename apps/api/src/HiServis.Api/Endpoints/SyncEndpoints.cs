using System.Text.Json;
using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class SyncEndpoints
{
    private static readonly Guid DefaultTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static void MapSyncEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/sync").WithTags("OfflineSync");

        // 1. Check Sync Server Status & Get Current HLC
        group.MapGet("/status", (ITenantContext tenantContext) =>
        {
            var serverHlc = HlcTimestamp.Now(Environment.MachineName);
            return Results.Ok(new
            {
                status = "online",
                serverHlc = serverHlc.ToPackedLong(),
                serverTime = DateTimeOffset.UtcNow,
                tenantId = tenantContext.TenantId ?? DefaultTenantId
            });
        });

        // 2. Idempotent Batch Sync Endpoint
        group.MapPost("/batch", async (
            SyncBatchRequest request,
            HiServisDbContext db,
            ITenantContext tenantContext,
            CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;
            var localNowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var incomingHlc = HlcTimestamp.FromPackedLong(request.ClientHlc);
            var serverHlc = HlcTimestamp.Now(Environment.MachineName).Update(incomingHlc, localNowMs);

            var results = new List<SyncMutationResult>();
            int appliedCount = 0;
            int quarantinedCount = 0;
            int skippedCount = 0;

            foreach (var mutation in request.Mutations)
            {
                // 1. Idempotency Check: Already processed?
                var isProcessed = await db.ProcessedClientMutations
                    .AnyAsync(m => m.MutationId == mutation.MutationId, ct);

                if (isProcessed)
                {
                    results.Add(new SyncMutationResult(
                        mutation.MutationId,
                        mutation.WorkOrderId,
                        "Duplicate",
                        "Bu mutasyon daha önce işlendi (Idempotent Atlandı)."
                    ));
                    skippedCount++;
                    continue;
                }

                // 2. Find Target WorkOrder
                var wo = await db.WorkOrders
                    .Include(w => w.Asset)
                    .Include(w => w.Lines)
                    .Include(w => w.PartRequests)
                    .FirstOrDefaultAsync(w => w.Id == mutation.WorkOrderId, ct);

                if (wo == null)
                {
                    results.Add(new SyncMutationResult(
                        mutation.MutationId,
                        mutation.WorkOrderId,
                        "Rejected",
                        $"İş emri bulunamadı (#WO-ID: {mutation.WorkOrderId})."
                    ));
                    skippedCount++;
                    continue;
                }

                // 3. Conflict Detection Engine:
                // Server State is Cancelled (or Invoiced) but Client mutation did physical work (WorkOrderCompleted / InstallPart)
                var hasStatusConflict =
                    (wo.Status == WorkOrderStatus.Cancelled || wo.Status == WorkOrderStatus.Invoiced) &&
                    (mutation.ActionType == "WorkOrderCompleted" || mutation.ActionType == "InstallPart");

                if (hasStatusConflict)
                {
                    // Trigger Silent Quarantine!
                    var serverSnapshot = JsonSerializer.Serialize(new
                    {
                        Status = wo.Status.ToString(),
                        WorkOrderNumber = wo.WorkOrderNumber,
                        Asset = wo.Asset?.PrimaryIdentifier ?? "Bilinmeyen",
                        GrandTotal = wo.GrandTotal,
                        UpdatedAt = wo.UpdatedAt,
                        CancelledReason = "Ofis Danışmanı Tarafından Web Panelinden İptal Edildi"
                    });

                    var incident = new QuarantineIncident
                    {
                        Id = Guid.NewGuid(),
                        TenantId = wo.TenantId,
                        BranchId = wo.BranchId,
                        WorkOrderId = wo.Id,
                        ConflictType = "STATUS_CONFLICT_CANCEL_VS_COMPLETE",
                        ServerStateJson = serverSnapshot,
                        ClientStateJson = mutation.PayloadJson,
                        ResolutionStatus = "PendingReview",
                        CreatedAt = DateTimeOffset.UtcNow
                    };

                    db.QuarantineIncidents.Add(incident);

                    // Set WorkOrder into Quarantine Review
                    wo.Status = WorkOrderStatus.QuarantineReview;
                    wo.UpdatedAt = DateTimeOffset.UtcNow;
                    wo.HlcTimestamp = serverHlc.ToPackedLong();

                    // Record processed mutation as Quarantined
                    db.ProcessedClientMutations.Add(new ProcessedClientMutation
                    {
                        TenantId = tenantId,
                        MutationId = mutation.MutationId,
                        ClientDeviceId = request.ClientDeviceId,
                        ActionType = mutation.ActionType,
                        WorkOrderId = mutation.WorkOrderId,
                        Status = "Quarantined"
                    });

                    results.Add(new SyncMutationResult(
                        mutation.MutationId,
                        mutation.WorkOrderId,
                        "Quarantined",
                        "Ofiste iptal edilen iş emrine sahada müdahale tespit edildi. İşlem karantinaya alındı.",
                        incident.Id
                    ));
                    quarantinedCount++;
                }
                else
                {
                    // 4. Normal Progression (No Conflict)
                    if (mutation.ActionType == "WorkOrderCompleted")
                    {
                        wo.Status = WorkOrderStatus.Completed;
                        wo.IsLaborRunning = false;
                        wo.UpdatedAt = DateTimeOffset.UtcNow;
                        wo.HlcTimestamp = serverHlc.ToPackedLong();

                        try
                        {
                            using var doc = JsonDocument.Parse(mutation.PayloadJson);
                            if (doc.RootElement.TryGetProperty("elapsedSeconds", out var elapsedProp))
                            {
                                wo.LaborElapsedSeconds = elapsedProp.GetInt32();
                            }
                            if (doc.RootElement.TryGetProperty("internalNotes", out var notesProp))
                            {
                                wo.InternalNotes = (wo.InternalNotes != null ? wo.InternalNotes + " • " : "") + notesProp.GetString();
                            }
                        }
                        catch { /* payload parsing optional fallback */ }
                    }
                    else if (mutation.ActionType == "InstallPart")
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(mutation.PayloadJson);
                            var sku = doc.RootElement.TryGetProperty("partSku", out var skuProp) ? skuProp.GetString() : "PARCA-001";
                            var partName = doc.RootElement.TryGetProperty("partName", out var nameProp) ? nameProp.GetString() : "Yedek Parça";
                            var qty = doc.RootElement.TryGetProperty("quantity", out var qtyProp) ? qtyProp.GetInt32() : 1;

                            // Update existing request or add installed line
                            var existingReq = wo.PartRequests.FirstOrDefault(r => r.PartSku == sku);
                            if (existingReq != null)
                            {
                                existingReq.Status = "Installed";
                                existingReq.AllocatedQuantity = Math.Max(existingReq.AllocatedQuantity, qty);
                            }
                            else
                            {
                                wo.PartRequests.Add(new WorkOrderPartRequest
                                {
                                    TenantId = wo.TenantId,
                                    WorkOrderId = wo.Id,
                                    PartSku = sku ?? "UNKNOWN",
                                    PartName = partName ?? "Yedek Parça",
                                    RequestedQuantity = qty,
                                    AllocatedQuantity = qty,
                                    Status = "Installed"
                                });
                            }

                            wo.UpdatedAt = DateTimeOffset.UtcNow;
                            wo.HlcTimestamp = serverHlc.ToPackedLong();
                        }
                        catch { /* payload parsing fallback */ }
                    }
                    else if (mutation.ActionType == "UpdateMeter")
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(mutation.PayloadJson);
                            if (doc.RootElement.TryGetProperty("meter", out var meterProp))
                            {
                                wo.IntakeMeter = meterProp.GetInt32();
                                if (wo.Asset != null)
                                {
                                    wo.Asset.CurrentMeter = Math.Max(wo.Asset.CurrentMeter, wo.IntakeMeter);
                                }
                            }
                        }
                        catch { }
                    }

                    // Record processed mutation
                    db.ProcessedClientMutations.Add(new ProcessedClientMutation
                    {
                        TenantId = tenantId,
                        MutationId = mutation.MutationId,
                        ClientDeviceId = request.ClientDeviceId,
                        ActionType = mutation.ActionType,
                        WorkOrderId = mutation.WorkOrderId,
                        Status = "Applied"
                    });

                    results.Add(new SyncMutationResult(
                        mutation.MutationId,
                        mutation.WorkOrderId,
                        "Applied",
                        "Mutasyon başarıyla sunucuya eşitlendi."
                    ));
                    appliedCount++;
                }
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new SyncBatchResponse(
                serverHlc.ToPackedLong(),
                results,
                appliedCount,
                quarantinedCount,
                skippedCount
            ));
        });
    }
}
