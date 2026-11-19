using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class WorkOrderEndpoints
{
    public static void MapWorkOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/workorders").WithTags("WorkOrders");

        // List Work Orders (Scoped by RLS / TenantContext automatically)
        group.MapGet("/", async (HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (tenantContext.TenantId == null)
            {
                return Results.BadRequest(new { error = "Geçerli bir kiracı (Tenant) oturumu bulunamadı." });
            }

            var workOrders = await db.WorkOrders
                .Include(w => w.Asset)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new WorkOrderDto(
                    w.Id,
                    w.TenantId,
                    w.BranchId,
                    w.WorkOrderNumber,
                    w.Asset != null ? w.Asset.PrimaryIdentifier : string.Empty,
                    w.Asset != null ? $"{w.Asset.Brand} {w.Asset.Model}" : string.Empty,
                    w.CustomerName,
                    w.CustomerPhone,
                    w.Status,
                    w.IntakeMeter,
                    w.CustomerComplaint,
                    w.GrandTotal,
                    w.RemainingBalance,
                    w.CreatedAt
                ))
                .ToListAsync(ct);

            return Results.Ok(workOrders);
        })
        .WithName("GetWorkOrders")
        .WithSummary("Şubeye ve Kiracıya Özel İş Emirleri Listesi");

        // Get single Work Order
        group.MapGet("/{id:guid}", async (Guid id, HiServisDbContext db, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders
                .Include(w => w.Asset)
                .Include(w => w.Lines)
                .Include(w => w.PartRequests)
                .FirstOrDefaultAsync(w => w.Id == id, ct);

            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            return Results.Ok(wo);
        })
        .WithName("GetWorkOrderById");

        // Create new Work Order (Rapid Vehicle Intake)
        group.MapPost("/", async (CreateWorkOrderRequest request, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (tenantContext.TenantId == null || tenantContext.BranchId == null)
            {
                return Results.BadRequest(new { error = "Oturumda TenantId ve BranchId zorunludur." });
            }

            var tenantId = tenantContext.TenantId.Value;
            var branchId = tenantContext.BranchId.Value;

            // 1. Resolve or create Asset
            var normalizedPlate = request.Plate.Trim().ToUpperInvariant();
            var asset = await db.Assets.FirstOrDefaultAsync(a => a.TenantId == tenantId && a.PrimaryIdentifier == normalizedPlate, ct);
            if (asset == null)
            {
                asset = new Asset
                {
                    TenantId = tenantId,
                    PrimaryIdentifier = normalizedPlate,
                    Brand = request.Brand,
                    Model = request.Model,
                    CurrentMeter = request.IntakeMeter
                };
                db.Assets.Add(asset);
                await db.SaveChangesAsync(ct);
            }
            else
            {
                asset.CurrentMeter = Math.Max(asset.CurrentMeter, request.IntakeMeter);
            }

            var woCount = await db.WorkOrders.CountAsync(ct);
            var woNumber = $"WO-2026-{(10000 + woCount + 1)}";

            var workOrder = new WorkOrder
            {
                TenantId = tenantId,
                BranchId = branchId,
                AssetId = asset.Id,
                WorkOrderNumber = woNumber,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                CustomerComplaint = request.CustomerComplaint,
                TechnicianUserId = request.TechnicianUserId,
                Status = WorkOrderStatus.Open,
                IntakeMeter = request.IntakeMeter
            };

            db.WorkOrders.Add(workOrder);

            // Add Outbox Event for transactional event publishing
            var outbox = new OutboxEvent
            {
                TenantId = tenantId,
                AggregateType = "WorkOrder",
                AggregateId = workOrder.Id,
                EventType = "WorkOrderCreatedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { workOrder.Id, woNumber, Plate = normalizedPlate })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/v1/workorders/{workOrder.Id}", workOrder);
        })
        .WithName("CreateWorkOrder");

        // Update Status (with conflict / state change audit)
        group.MapPut("/{id:guid}/status", async (Guid id, WorkOrderStatus newStatus, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            var oldStatus = wo.Status;
            wo.Status = newStatus;
            wo.UpdatedAt = DateTimeOffset.UtcNow;
            wo.HlcTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Record outbox event
            var outbox = new OutboxEvent
            {
                TenantId = wo.TenantId,
                AggregateType = "WorkOrder",
                AggregateId = wo.Id,
                EventType = "WorkOrderStatusChangedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { wo.Id, oldStatus = oldStatus.ToString(), newStatus = newStatus.ToString() })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            return Results.Ok(new { success = true, oldStatus, newStatus, wo.WorkOrderNumber });
        })
        .WithName("UpdateWorkOrderStatus");
    }
}
