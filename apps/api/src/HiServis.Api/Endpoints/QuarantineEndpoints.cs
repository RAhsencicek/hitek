using System.Text.Json;
using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class QuarantineEndpoints
{
    private static readonly Guid DefaultTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static void MapQuarantineEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quarantine").WithTags("Quarantine");

        // 1. List Quarantine Incidents
        group.MapGet("/incidents", async (
            string? status,
            HiServisDbContext db,
            ITenantContext tenantContext,
            CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;

            var query = db.QuarantineIncidents
                .Include(q => q.WorkOrder)
                .ThenInclude(w => w!.Asset)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                query = query.Where(q => q.ResolutionStatus.ToLower() == status.ToLower());
            }

            var incidents = await query
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(ct);

            var dtoList = incidents.Select(i => new QuarantineIncidentDto(
                i.Id,
                i.WorkOrderId,
                i.WorkOrder?.WorkOrderNumber ?? "WO-UNKNOWN",
                i.WorkOrder?.Asset?.PrimaryIdentifier ?? "Bilinmeyen Varlık",
                i.ConflictType,
                i.ServerStateJson,
                i.ClientStateJson,
                i.ResolutionStatus,
                i.ResolutionAction,
                i.ManagerNotes,
                i.CreatedAt,
                i.ResolvedAt,
                i.ResolvedByUserId != null ? "Servis Müdürü (Hakan Danışman)" : null
            )).ToList();

            return Results.Ok(dtoList);
        });

        // 2. Get Incident Details
        group.MapGet("/incidents/{id:guid}", async (
            Guid id,
            HiServisDbContext db,
            CancellationToken ct) =>
        {
            var i = await db.QuarantineIncidents
                .Include(q => q.WorkOrder)
                .ThenInclude(w => w!.Asset)
                .FirstOrDefaultAsync(q => q.Id == id, ct);

            if (i == null) return Results.NotFound("Karantina olayı bulunamadı.");

            var dto = new QuarantineIncidentDto(
                i.Id,
                i.WorkOrderId,
                i.WorkOrder?.WorkOrderNumber ?? "WO-UNKNOWN",
                i.WorkOrder?.Asset?.PrimaryIdentifier ?? "Bilinmeyen Varlık",
                i.ConflictType,
                i.ServerStateJson,
                i.ClientStateJson,
                i.ResolutionStatus,
                i.ResolutionAction,
                i.ManagerNotes,
                i.CreatedAt,
                i.ResolvedAt,
                i.ResolvedByUserId != null ? "Servis Müdürü (Hakan Danışman)" : null
            );

            return Results.Ok(dto);
        });

        // 3. Resolve Quarantine Incident (Hakemlik Kararı)
        group.MapPost("/incidents/{id:guid}/resolve", async (
            Guid id,
            ResolveQuarantineRequest request,
            HiServisDbContext db,
            ITenantContext tenantContext,
            CancellationToken ct) =>
        {
            var incident = await db.QuarantineIncidents
                .Include(q => q.WorkOrder)
                .ThenInclude(w => w!.PartRequests)
                .FirstOrDefaultAsync(q => q.Id == id, ct);

            if (incident == null) return Results.NotFound("Karantina olayı bulunamadı.");

            if (incident.ResolutionStatus != "PendingReview")
            {
                return Results.BadRequest(new
                {
                    message = "Bu karantina olayı daha önce çözümlenmiş.",
                    resolvedAt = incident.ResolvedAt,
                    resolutionAction = incident.ResolutionAction
                });
            }

            var wo = incident.WorkOrder;
            if (wo == null) return Results.BadRequest("İlişkili iş emri kaydı bulunamadı.");

            var resolvedAt = DateTimeOffset.UtcNow;
            string message;
            string newStatus;

            switch (request.ResolutionAction)
            {
                case "AcceptClientState":
                    // Saha haklı: Teknisyenin yaptığı fiziksel işçilik ve takılan parçalar kabul edilir
                    wo.Status = WorkOrderStatus.Completed;
                    wo.UpdatedAt = resolvedAt;
                    newStatus = "Completed";

                    // Takılan parçaları onayla
                    foreach (var pr in wo.PartRequests)
                    {
                        if (pr.Status != "Installed")
                        {
                            pr.Status = "Installed";
                        }
                    }

                    incident.ResolutionStatus = "ResolvedByManager";
                    incident.ResolutionAction = "AcceptClientState";
                    incident.ManagerNotes = request.ManagerNotes ?? "Saha müdahalesi servis müdürü tarafından onaylandı. İş emri tamamlandıya çekildi.";
                    incident.ResolvedAt = resolvedAt;
                    incident.ResolvedByUserId = tenantContext.UserId ?? Guid.Parse("44444444-4444-4444-4444-444444444444");

                    message = "Saha durumu kabul edildi. İş emri tamamlandı olarak güncellendi ve parçalar stoktan düşüldü.";
                    break;

                case "AcceptServerState":
                    // Ofis haklı: İptal kararı geçerlidir, teknisyenin taktığı parça iadeye çekilir
                    wo.Status = WorkOrderStatus.Cancelled;
                    wo.UpdatedAt = resolvedAt;
                    newStatus = "Cancelled";

                    // Parçalar tersine lojistiğe (iade rafına) yönlendirilir
                    foreach (var pr in wo.PartRequests)
                    {
                        pr.Status = "Returned";
                    }

                    incident.ResolutionStatus = "ResolvedByManager";
                    incident.ResolutionAction = "AcceptServerState";
                    incident.ManagerNotes = request.ManagerNotes ?? "Ofis iptal kararı korundu. Takılan parçalar sökülerek ReturnToSupplier rafına yönlendirildi.";
                    incident.ResolvedAt = resolvedAt;
                    incident.ResolvedByUserId = tenantContext.UserId ?? Guid.Parse("44444444-4444-4444-4444-444444444444");

                    message = "Ofis iptal kararı korundu. İş emri iptal edildi, parçalar iade rafına aktarıldı.";
                    break;

                case "ManualCorrection":
                    // Manuel müdahale: İşlem tekrar InProgress'e alınır, usta ve danışman mutabakatına bırakılır
                    wo.Status = WorkOrderStatus.InProgress;
                    wo.UpdatedAt = resolvedAt;
                    newStatus = "InProgress";

                    incident.ResolutionStatus = "ResolvedByManager";
                    incident.ResolutionAction = "ManualCorrection";
                    incident.ManagerNotes = request.ManagerNotes ?? "Servis müdürü manuel düzenleme yaptı.";
                    incident.ResolvedAt = resolvedAt;
                    incident.ResolvedByUserId = tenantContext.UserId ?? Guid.Parse("44444444-4444-4444-4444-444444444444");

                    message = "İş emri manuel düzenleme için devam eden duruma alındı.";
                    break;

                default:
                    return Results.BadRequest("Geçersiz çözüm aksiyonu. Beklenen: 'AcceptClientState', 'AcceptServerState' veya 'ManualCorrection'.");
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new ResolveQuarantineResultDto(
                true,
                message,
                incident.Id,
                incident.ResolutionStatus,
                newStatus,
                resolvedAt
            ));
        });

        // 4. Demo Helper: Simulate Conflict (Ofis İptal vs Saha Tamamlandı)
        group.MapPost("/simulate-conflict", async (
            HiServisDbContext db,
            ITenantContext tenantContext,
            CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;
            var branchId = tenantContext.BranchId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");

            // Check if there is an existing demo asset or create one
            var asset = await db.Assets.FirstOrDefaultAsync(ct);
            if (asset == null)
            {
                asset = new Asset
                {
                    TenantId = tenantId,
                    PrimaryIdentifier = "34 ABC 123",
                    Brand = "Volkswagen",
                    Model = "Passat 1.6 TDI",
                    ModelYear = 2021
                };
                db.Assets.Add(asset);
                await db.SaveChangesAsync(ct);
            }

            // Create a work order that is CANCELLED on the server
            var woNumber = $"WO-SIM-{Random.Shared.Next(10000, 99999)}";
            var wo = new WorkOrder
            {
                TenantId = tenantId,
                BranchId = branchId,
                AssetId = asset.Id,
                WorkOrderNumber = woNumber,
                CustomerName = "Ahmet Çakışma Testi",
                CustomerPhone = "0532 999 0011",
                Status = WorkOrderStatus.Cancelled, // Ofiste iptal edilmiş!
                IntakeMeter = 145000,
                CustomerComplaint = "Ön disk balata değişimi (Müşteri 10 dk önce arayıp iptal etti)",
                GrandTotal = 2400.00m,
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-30),
                UpdatedAt = DateTimeOffset.UtcNow.AddMinutes(-10)
            };

            db.WorkOrders.Add(wo);
            await db.SaveChangesAsync(ct);

            // Now send an offline mutation that completed the work order in the basement!
            var clientMutation = new SyncMutationItem(
                Guid.NewGuid(),
                "WorkOrderCompleted",
                wo.Id,
                HlcTimestamp.Now("MOBILE-TABLET-01").ToPackedLong(),
                JsonSerializer.Serialize(new
                {
                    status = "Completed",
                    completedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
                    completedBy = "Ahmet Usta (LIFT-1)",
                    elapsedSeconds = 4800,
                    installedParts = new[]
                    {
                        new { partSku = "4047024185242", partName = "Bosch Ön Fren Balata Takımı", quantity = 1 }
                    },
                    technicianNotes = "Bodrum katında internet yokken balatalar takıldı, diskler zımparalandı. Müşteri çevrimdışı imza attı.",
                    offlineSignatureToken = "SIG-OFFLINE-99210-PASS"
                })
            );

            // Trigger sync batch with this mutation
            var clientDeviceId = "TABLET-LIFT-1";
            var incomingHlc = HlcTimestamp.FromPackedLong(clientMutation.MutationHlc);
            var serverHlc = HlcTimestamp.Now(Environment.MachineName).Update(incomingHlc, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());

            // Conflict detected because wo.Status is Cancelled!
            var incident = new QuarantineIncident
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                WorkOrderId = wo.Id,
                ConflictType = "STATUS_CONFLICT_CANCEL_VS_COMPLETE",
                ServerStateJson = JsonSerializer.Serialize(new
                {
                    Status = wo.Status.ToString(),
                    WorkOrderNumber = wo.WorkOrderNumber,
                    Asset = asset.PrimaryIdentifier,
                    GrandTotal = wo.GrandTotal,
                    UpdatedAt = wo.UpdatedAt,
                    CancelledReason = "Ofis Danışmanı: Müşteri arayıp işlemi iptal etti."
                }),
                ClientStateJson = clientMutation.PayloadJson,
                ResolutionStatus = "PendingReview",
                CreatedAt = DateTimeOffset.UtcNow
            };

            db.QuarantineIncidents.Add(incident);

            wo.Status = WorkOrderStatus.QuarantineReview;
            wo.UpdatedAt = DateTimeOffset.UtcNow;
            wo.HlcTimestamp = serverHlc.ToPackedLong();

            db.ProcessedClientMutations.Add(new ProcessedClientMutation
            {
                TenantId = tenantId,
                MutationId = clientMutation.MutationId,
                ClientDeviceId = clientDeviceId,
                ActionType = clientMutation.ActionType,
                WorkOrderId = clientMutation.WorkOrderId,
                Status = "Quarantined"
            });

            await db.SaveChangesAsync(ct);

            return Results.Ok(new
            {
                success = true,
                message = "Simülasyon Çakışması Başarıyla Tetiklendi!",
                workOrderId = wo.Id,
                workOrderNumber = wo.WorkOrderNumber,
                quarantineIncidentId = incident.Id,
                status = wo.Status.ToString()
            });
        });
    }
}
