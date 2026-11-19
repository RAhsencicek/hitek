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
                    w.CreatedAt,
                    w.Priority,
                    w.BayId,
                    w.IsLaborRunning,
                    w.LaborElapsedSeconds,
                    w.TargetLaborMinutes
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

        // Faz 1: Hızlı Araç Kabul (Rapid Vehicle Intake with 2D Damage Pins & TSB)
        group.MapPost("/intake", async (CreateIntakeRequest request, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (tenantContext.TenantId == null)
            {
                return Results.BadRequest(new { error = "Oturumda TenantId zorunludur." });
            }

            var tenantId = tenantContext.TenantId.Value;
            var branchId = request.BranchId ?? tenantContext.BranchId;
            if (branchId == null)
            {
                return Results.BadRequest(new { error = "Şube kimliği (BranchId) zorunludur." });
            }

            if (request.Asset == null || string.IsNullOrWhiteSpace(request.Asset.PlateNumber))
            {
                return Results.BadRequest(new { error = "Araç ve plaka bilgisi zorunludur." });
            }

            if (request.Customer == null || string.IsNullOrWhiteSpace(request.Customer.FullName) || string.IsNullOrWhiteSpace(request.Customer.Phone))
            {
                return Results.BadRequest(new { error = "Müşteri adı ve telefon numarası zorunludur." });
            }

            // 1. Normalize Plate: e.g. "34abc123" -> "34 ABC 123"
            var rawPlate = request.Asset.PlateNumber.Trim().ToUpperInvariant().Replace(" ", "");
            var formattedPlate = request.Asset.PlateNumber.Trim().ToUpperInvariant();
            if (System.Text.RegularExpressions.Regex.IsMatch(rawPlate, @"^\d{2}[A-Z]{1,3}\d{2,4}$"))
            {
                var match = System.Text.RegularExpressions.Regex.Match(rawPlate, @"^(\d{2})([A-Z]{1,3})(\d{2,4})$");
                formattedPlate = $"{match.Groups[1].Value} {match.Groups[2].Value} {match.Groups[3].Value}";
            }

            // 2. Resolve or Create Asset
            var asset = await db.Assets
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && (a.PrimaryIdentifier == formattedPlate || a.PrimaryIdentifier.Replace(" ", "").ToUpper() == rawPlate), ct);

            var intakeMeter = request.IntakeDetails?.IntakeMeter ?? request.Asset.CurrentMeter;
            var damageMarkers = request.IntakeDetails?.DamageInspectionMarkers ?? new List<DamageMarkerDto>();
            var damageMarkersJson = System.Text.Json.JsonSerializer.Serialize(damageMarkers);

            if (asset == null)
            {
                asset = new Asset
                {
                    TenantId = tenantId,
                    PrimaryIdentifier = formattedPlate,
                    SecondaryIdentifier = request.Asset.Vin?.Trim().ToUpperInvariant(),
                    Brand = request.Asset.Brand,
                    Model = request.Asset.Model,
                    ModelYear = request.Asset.ModelYear,
                    TsbCode = request.Asset.TsbCode,
                    CurrentMeter = intakeMeter,
                    DynamicAttributesJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        fuelLevel = request.IntakeDetails?.FuelLevelRatio ?? 0.5,
                        damageInspectionMarkers = damageMarkers
                    })
                };
                db.Assets.Add(asset);
                await db.SaveChangesAsync(ct);
            }
            else
            {
                asset.CurrentMeter = Math.Max(asset.CurrentMeter, intakeMeter);
                if (!string.IsNullOrWhiteSpace(request.Asset.Vin)) asset.SecondaryIdentifier = request.Asset.Vin;
                if (!string.IsNullOrWhiteSpace(request.Asset.TsbCode)) asset.TsbCode = request.Asset.TsbCode;
            }

            // 3. Generate Work Order Number
            var woCount = await db.WorkOrders.CountAsync(ct);
            var woNumber = $"WO-2026-{(10000 + woCount + 1)}";

            var workOrder = new WorkOrder
            {
                TenantId = tenantId,
                BranchId = branchId.Value,
                AssetId = asset.Id,
                WorkOrderNumber = woNumber,
                CustomerName = request.Customer.FullName.Trim(),
                CustomerPhone = request.Customer.Phone.Trim(),
                TechnicianUserId = request.TechnicianUserId,
                BayId = request.BayId,
                Status = request.BayId.HasValue ? WorkOrderStatus.InProgress : WorkOrderStatus.Open,
                Priority = request.Priority ?? "Normal",
                IntakeMeter = intakeMeter,
                CustomerComplaint = request.IntakeDetails?.CustomerComplaint,
                DamageMarkersJson = damageMarkersJson,
                TargetLaborMinutes = 120,
                LaborElapsedSeconds = 0,
                IsLaborRunning = false
            };

            db.WorkOrders.Add(workOrder);

            // If a bay is selected, link the work order to the bay
            if (request.BayId.HasValue)
            {
                var bay = await db.WorkshopBays.FirstOrDefaultAsync(b => b.Id == request.BayId.Value, ct);
                if (bay != null)
                {
                    bay.CurrentWorkOrderId = workOrder.Id;
                    if (bay.AssignedTechnicianId.HasValue && !workOrder.TechnicianUserId.HasValue)
                    {
                        workOrder.TechnicianUserId = bay.AssignedTechnicianId;
                    }
                }
            }

            // 4. Outbox Event
            var outbox = new OutboxEvent
            {
                TenantId = tenantId,
                AggregateType = "WorkOrder",
                AggregateId = workOrder.Id,
                EventType = "WorkOrderIntakeCompletedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    workOrder.Id,
                    woNumber,
                    Plate = formattedPlate,
                    Customer = request.Customer.FullName,
                    intakeMeter,
                    damageMarkersCount = damageMarkers.Count
                })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            var magicLink = $"https://hiservis.link/{woNumber.ToLowerInvariant()}";
            var result = new IntakeResultDto(
                WorkOrderId: workOrder.Id,
                WorkOrderNumber: woNumber,
                AssetId: asset.Id,
                Plate: formattedPlate,
                VehicleDescription: $"{asset.Brand} {asset.Model}",
                CustomerName: workOrder.CustomerName,
                CustomerPhone: workOrder.CustomerPhone,
                Status: workOrder.Status,
                IntakeMeter: workOrder.IntakeMeter,
                CustomerComplaint: workOrder.CustomerComplaint,
                Priority: workOrder.Priority,
                DamageMarkers: damageMarkers,
                CreatedAt: workOrder.CreatedAt,
                CustomerMagicLink: magicLink
            );

            return Results.Created($"/api/v1/workorders/{workOrder.Id}", result);
        })
        .WithName("CreateIntakeWorkOrder")
        .WithSummary("Hızlı Araç Kabul & İş Emri Açma");

        // Faz 1: İşçilik Sayacı Başlat (Clock-in)
        group.MapPost("/{id:guid}/labor/clock-in", async (Guid id, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            if (!wo.IsLaborRunning)
            {
                wo.IsLaborRunning = true;
                wo.LaborStartedAt = DateTimeOffset.UtcNow;
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
                    EventType = "LaborClockInEvent",
                    PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { wo.Id, wo.WorkOrderNumber, wo.LaborStartedAt })
                };
                db.OutboxEvents.Add(outbox);

                await db.SaveChangesAsync(ct);
            }

            var totalElapsed = wo.LaborElapsedSeconds;
            if (wo.IsLaborRunning && wo.LaborStartedAt.HasValue)
            {
                totalElapsed += (int)(DateTimeOffset.UtcNow - wo.LaborStartedAt.Value).TotalSeconds;
            }

            var targetSecs = wo.TargetLaborMinutes * 60;
            var efficiency = targetSecs > 0 ? Math.Round((double)totalElapsed / targetSecs * 100, 1) : 0;

            return Results.Ok(new LaborTimerResultDto(
                wo.Id,
                wo.WorkOrderNumber,
                wo.IsLaborRunning,
                totalElapsed,
                wo.TargetLaborMinutes,
                efficiency,
                wo.LaborStartedAt
            ));
        })
        .WithName("ClockInLabor");

        // Faz 1: İşçilik Sayacı Durdur / Mola Ver (Clock-out)
        group.MapPost("/{id:guid}/labor/clock-out", async (Guid id, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            if (wo.IsLaborRunning && wo.LaborStartedAt.HasValue)
            {
                var additionalSeconds = (int)(DateTimeOffset.UtcNow - wo.LaborStartedAt.Value).TotalSeconds;
                wo.LaborElapsedSeconds += Math.Max(0, additionalSeconds);
                wo.IsLaborRunning = false;
                wo.LaborStartedAt = null;
                wo.UpdatedAt = DateTimeOffset.UtcNow;

                var outbox = new OutboxEvent
                {
                    TenantId = wo.TenantId,
                    AggregateType = "WorkOrder",
                    AggregateId = wo.Id,
                    EventType = "LaborClockOutEvent",
                    PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { wo.Id, wo.WorkOrderNumber, wo.LaborElapsedSeconds })
                };
                db.OutboxEvents.Add(outbox);

                await db.SaveChangesAsync(ct);
            }

            var totalElapsed = wo.LaborElapsedSeconds;
            if (wo.IsLaborRunning && wo.LaborStartedAt.HasValue)
            {
                totalElapsed += (int)(DateTimeOffset.UtcNow - wo.LaborStartedAt.Value).TotalSeconds;
            }

            var targetSecs = wo.TargetLaborMinutes * 60;
            var efficiency = targetSecs > 0 ? Math.Round((double)totalElapsed / targetSecs * 100, 1) : 0;

            return Results.Ok(new LaborTimerResultDto(
                wo.Id,
                wo.WorkOrderNumber,
                wo.IsLaborRunning,
                totalElapsed,
                wo.TargetLaborMinutes,
                efficiency,
                wo.LaborStartedAt
            ));
        })
        .WithName("ClockOutLabor");

        // Faz 1: Canlı İşçilik Sayacı Sorgula
        group.MapGet("/{id:guid}/labor/timer", async (Guid id, HiServisDbContext db, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            var totalElapsed = wo.LaborElapsedSeconds;
            if (wo.IsLaborRunning && wo.LaborStartedAt.HasValue)
            {
                totalElapsed += (int)(DateTimeOffset.UtcNow - wo.LaborStartedAt.Value).TotalSeconds;
            }

            var targetSecs = wo.TargetLaborMinutes * 60;
            var efficiency = targetSecs > 0 ? Math.Round((double)totalElapsed / targetSecs * 100, 1) : 0;

            return Results.Ok(new LaborTimerResultDto(
                wo.Id,
                wo.WorkOrderNumber,
                wo.IsLaborRunning,
                totalElapsed,
                wo.TargetLaborMinutes,
                efficiency,
                wo.LaborStartedAt
            ));
        })
        .WithName("GetLaborTimer");

        // Faz 1: Müşteri Kabul Fişi Verisi (Printable / PDF Data)
        group.MapGet("/{id:guid}/receipt", async (Guid id, HiServisDbContext db, CancellationToken ct) =>
        {
            var wo = await db.WorkOrders
                .Include(w => w.Asset)
                .Include(w => w.Branch)
                .Include(w => w.TechnicianUser)
                .FirstOrDefaultAsync(w => w.Id == id, ct);

            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            List<DamageMarkerDto> markers = new();
            if (!string.IsNullOrWhiteSpace(wo.DamageMarkersJson))
            {
                try
                {
                    markers = System.Text.Json.JsonSerializer.Deserialize<List<DamageMarkerDto>>(wo.DamageMarkersJson) ?? new();
                }
                catch { }
            }

            double fuelLevel = 0.5;
            if (!string.IsNullOrWhiteSpace(wo.Asset?.DynamicAttributesJson))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(wo.Asset.DynamicAttributesJson);
                    if (doc.RootElement.TryGetProperty("fuelLevel", out var prop) && prop.TryGetDouble(out var fl))
                    {
                        fuelLevel = fl;
                    }
                }
                catch { }
            }

            var receipt = new CustomerIntakeReceiptDto(
                WorkOrderNumber: wo.WorkOrderNumber,
                IntakeDate: wo.CreatedAt,
                Plate: wo.Asset?.PrimaryIdentifier ?? "",
                BrandModel: $"{wo.Asset?.Brand} {wo.Asset?.Model}".Trim(),
                ModelYear: wo.Asset?.ModelYear ?? 0,
                Vin: wo.Asset?.SecondaryIdentifier ?? "",
                Meter: wo.IntakeMeter,
                CustomerName: wo.CustomerName,
                CustomerPhone: wo.CustomerPhone,
                Complaint: wo.CustomerComplaint ?? "Belirtilmedi",
                FuelLevelRatio: fuelLevel,
                DamageMarkers: markers,
                ServiceAdvisor: wo.TechnicianUser?.FullName ?? "Servis Danışmanı",
                BranchName: wo.Branch?.Name ?? "HiServis Maslak",
                BranchPhone: wo.Branch?.Phone ?? "0212 555 0101"
            );

            return Results.Ok(receipt);
        })
        .WithName("GetCustomerIntakeReceipt");

        // Update Status (with conflict / state change audit)
        group.MapPut("/{id:guid}/status", async (Guid id, UpdateWorkOrderStatusRequest? request, WorkOrderStatus? newStatus, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var targetStatus = request?.Status ?? newStatus;
            if (!targetStatus.HasValue)
            {
                return Results.BadRequest(new { error = "Geçerli bir iş emri statüsü (Status) zorunludur." });
            }

            var wo = await db.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (wo == null) return Results.NotFound(new { error = "İş emri bulunamadı." });

            var oldStatus = wo.Status;
            wo.Status = targetStatus.Value;
            wo.UpdatedAt = DateTimeOffset.UtcNow;
            wo.HlcTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Record outbox event
            var outbox = new OutboxEvent
            {
                TenantId = wo.TenantId,
                AggregateType = "WorkOrder",
                AggregateId = wo.Id,
                EventType = "WorkOrderStatusChangedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { wo.Id, oldStatus = oldStatus.ToString(), newStatus = targetStatus.Value.ToString() })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            return Results.Ok(new { success = true, oldStatus, newStatus = targetStatus.Value, wo.WorkOrderNumber });
        })
        .WithName("UpdateWorkOrderStatus");
    }
}
