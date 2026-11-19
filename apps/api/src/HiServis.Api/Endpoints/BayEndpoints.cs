using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class BayEndpoints
{
    public static void MapBayEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/bays").WithTags("WorkshopBays");

        // List all bays for current branch with active work order details
        group.MapGet("/", async (Guid? branchId, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (tenantContext.TenantId == null)
            {
                return Results.BadRequest(new { error = "Oturumda TenantId zorunludur." });
            }

            var targetBranchId = branchId ?? tenantContext.BranchId;

            // Fetch bays
            var query = db.WorkshopBays
                .Include(b => b.AssignedTechnician)
                .Include(b => b.CurrentWorkOrder)
                    .ThenInclude(w => w!.Asset)
                .AsQueryable();

            if (targetBranchId.HasValue)
            {
                query = query.Where(b => b.BranchId == targetBranchId.Value);
            }

            var bays = await query
                .OrderBy(b => b.BayCode)
                .ToListAsync(ct);

            // If no bays exist yet in this branch, auto-initialize standard bays (Lift 1, Lift 2, Lift 3, Kalite Kontrol)
            if (bays.Count == 0 && targetBranchId.HasValue)
            {
                var techAhmet = await db.Users.FirstOrDefaultAsync(u => u.BranchId == targetBranchId.Value && u.Role == UserRole.Technician, ct);

                var defaultBays = new List<WorkshopBay>
                {
                    new()
                    {
                        TenantId = tenantContext.TenantId.Value,
                        BranchId = targetBranchId.Value,
                        BayCode = "LIFT-1",
                        Name = "LİFT 1 (Mekanik / Ağır Bakım)",
                        BayType = "Mechanic",
                        AssignedTechnicianId = techAhmet?.Id,
                        IsActive = true
                    },
                    new()
                    {
                        TenantId = tenantContext.TenantId.Value,
                        BranchId = targetBranchId.Value,
                        BayCode = "LIFT-2",
                        Name = "LİFT 2 (Periyodik Hızlı Bakım)",
                        BayType = "PeriodicMaintenance",
                        IsActive = true
                    },
                    new()
                    {
                        TenantId = tenantContext.TenantId.Value,
                        BranchId = targetBranchId.Value,
                        BayCode = "LIFT-3",
                        Name = "LİFT 3 (Rot-Balans / Ön Takım)",
                        BayType = "WheelAlignment",
                        IsActive = true
                    },
                    new()
                    {
                        TenantId = tenantContext.TenantId.Value,
                        BranchId = targetBranchId.Value,
                        BayCode = "BAY-QC",
                        Name = "Kalite Kontrol & Teslimat",
                        BayType = "QualityInspection",
                        IsActive = true
                    }
                };

                db.WorkshopBays.AddRange(defaultBays);
                await db.SaveChangesAsync(ct);

                bays = await query
                    .OrderBy(b => b.BayCode)
                    .ToListAsync(ct);
            }

            var dtos = new List<WorkshopBayDto>();
            foreach (var bay in bays)
            {
                WorkOrderDto? currentWoDto = null;
                if (bay.CurrentWorkOrder != null)
                {
                    var wo = bay.CurrentWorkOrder;
                    var elapsed = wo.LaborElapsedSeconds;
                    if (wo.IsLaborRunning && wo.LaborStartedAt.HasValue)
                    {
                        elapsed += (int)(DateTimeOffset.UtcNow - wo.LaborStartedAt.Value).TotalSeconds;
                    }

                    currentWoDto = new WorkOrderDto(
                        wo.Id,
                        wo.TenantId,
                        wo.BranchId,
                        wo.WorkOrderNumber,
                        wo.Asset?.PrimaryIdentifier ?? "",
                        $"{wo.Asset?.Brand} {wo.Asset?.Model}".Trim(),
                        wo.CustomerName,
                        wo.CustomerPhone,
                        wo.Status,
                        wo.IntakeMeter,
                        wo.CustomerComplaint,
                        wo.GrandTotal,
                        wo.RemainingBalance,
                        wo.CreatedAt,
                        wo.Priority,
                        wo.BayId,
                        wo.IsLaborRunning,
                        elapsed,
                        wo.TargetLaborMinutes
                    );
                }

                var queueCount = await db.WorkOrders
                    .CountAsync(w => w.BayId == bay.Id && w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Invoiced && w.Status != WorkOrderStatus.Cancelled && (bay.CurrentWorkOrderId == null || w.Id != bay.CurrentWorkOrderId), ct);

                dtos.Add(new WorkshopBayDto(
                    bay.Id,
                    bay.BranchId,
                    bay.BayCode,
                    bay.Name,
                    bay.BayType,
                    bay.AssignedTechnicianId,
                    bay.AssignedTechnician?.FullName,
                    bay.CurrentWorkOrderId,
                    currentWoDto,
                    bay.IsActive,
                    queueCount
                ));
            }

            return Results.Ok(dtos);
        })
        .WithName("GetWorkshopBays")
        .WithSummary("Şubedeki Tüm Lift ve İstasyonların Listesi");

        // Assign vehicle / work order to a bay
        group.MapPost("/{id:guid}/assign", async (Guid id, AssignBayRequest request, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var bay = await db.WorkshopBays
                .Include(b => b.AssignedTechnician)
                .FirstOrDefaultAsync(b => b.Id == id, ct);

            if (bay == null) return Results.NotFound(new { error = "Lift istasyonu bulunamadı." });

            var wo = await db.WorkOrders
                .Include(w => w.Asset)
                .FirstOrDefaultAsync(w => w.Id == request.WorkOrderId, ct);

            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            // Assign work order to bay
            wo.BayId = bay.Id;
            bay.CurrentWorkOrderId = wo.Id;

            var techId = request.TechnicianUserId ?? bay.AssignedTechnicianId;
            if (techId.HasValue)
            {
                wo.TechnicianUserId = techId.Value;
            }

            if (wo.Status == WorkOrderStatus.Open)
            {
                wo.Status = WorkOrderStatus.InProgress;
            }

            wo.UpdatedAt = DateTimeOffset.UtcNow;

            var outbox = new OutboxEvent
            {
                TenantId = wo.TenantId,
                AggregateType = "WorkOrder",
                AggregateId = wo.Id,
                EventType = "WorkOrderAssignedToBayEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    workOrderId = wo.Id,
                    bayId = bay.Id,
                    bayCode = bay.BayCode,
                    technicianId = techId
                })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            var woDto = new WorkOrderDto(
                wo.Id,
                wo.TenantId,
                wo.BranchId,
                wo.WorkOrderNumber,
                wo.Asset?.PrimaryIdentifier ?? "",
                $"{wo.Asset?.Brand} {wo.Asset?.Model}".Trim(),
                wo.CustomerName,
                wo.CustomerPhone,
                wo.Status,
                wo.IntakeMeter,
                wo.CustomerComplaint,
                wo.GrandTotal,
                wo.RemainingBalance,
                wo.CreatedAt,
                wo.Priority,
                wo.BayId,
                wo.IsLaborRunning,
                wo.LaborElapsedSeconds,
                wo.TargetLaborMinutes
            );

            return Results.Ok(new WorkshopBayDto(
                bay.Id,
                bay.BranchId,
                bay.BayCode,
                bay.Name,
                bay.BayType,
                bay.AssignedTechnicianId,
                bay.AssignedTechnician?.FullName,
                bay.CurrentWorkOrderId,
                woDto,
                bay.IsActive,
                0
            ));
        })
        .WithName("AssignWorkOrderToBay")
        .WithSummary("İş Emrini Lifte / İstasyona Atama");
    }
}
