using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class PurchaseOrderEndpoints
{
    private static readonly Guid DefaultTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid DefaultBranchId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public static void MapPurchaseOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/purchase-orders").WithTags("PurchaseOrders");

        // 1. List Purchase Orders
        group.MapGet("/", async (HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;

            var pos = await db.PurchaseOrders
                .Include(p => p.Lines)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(ct);

            // Fetch linked part requests for line metadata
            var poLineIds = pos.SelectMany(p => p.Lines).Select(l => l.Id).ToList();
            var linkedPartRequests = await db.WorkOrderPartRequests
                .Include(r => r.WorkOrder)
                .ThenInclude(w => w!.Asset)
                .Where(r => r.PoLineId.HasValue && poLineIds.Contains(r.PoLineId.Value))
                .ToListAsync(ct);

            var partRequestMap = linkedPartRequests
                .GroupBy(r => r.PoLineId!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            var dtoList = pos.Select(po =>
            {
                var lineDtos = po.Lines.Select(line =>
                {
                    partRequestMap.TryGetValue(line.Id, out var linkedReq);
                    return new PurchaseOrderLineDto(
                        line.Id,
                        line.PurchaseOrderId,
                        line.PartSku,
                        line.OemCode,
                        line.PartDescription,
                        line.OrderedQuantity,
                        line.ReceivedQuantity,
                        line.UnitPrice,
                        line.UnitPrice * line.OrderedQuantity,
                        line.Status,
                        linkedReq?.Id,
                        linkedReq?.WorkOrder?.WorkOrderNumber,
                        linkedReq?.WorkOrder?.Asset?.PrimaryIdentifier
                    );
                }).ToList();

                var totalOrdered = lineDtos.Sum(l => l.OrderedQuantity);
                var totalReceived = lineDtos.Sum(l => l.ReceivedQuantity);

                return new PurchaseOrderDto(
                    po.Id,
                    po.TenantId,
                    po.BranchId,
                    po.PoNumber,
                    po.SupplierName,
                    po.SupplierTaxNo,
                    po.Status,
                    po.TotalAmount,
                    totalOrdered,
                    totalReceived,
                    po.CreatedAt,
                    lineDtos
                );
            }).ToList();

            return Results.Ok(dtoList);
        })
        .WithName("GetPurchaseOrders")
        .WithSummary("Konsolide Satınalma Siparişleri Listesi");

        // 2. Get Single Purchase Order
        group.MapGet("/{id:guid}", async (Guid id, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var po = await db.PurchaseOrders
                .Include(p => p.Lines)
                .FirstOrDefaultAsync(p => p.Id == id, ct);

            if (po == null)
            {
                return Results.NotFound(new { error = "Satınalma siparişi bulunamadı." });
            }

            var poLineIds = po.Lines.Select(l => l.Id).ToList();
            var linkedPartRequests = await db.WorkOrderPartRequests
                .Include(r => r.WorkOrder)
                .ThenInclude(w => w!.Asset)
                .Where(r => r.PoLineId.HasValue && poLineIds.Contains(r.PoLineId.Value))
                .ToListAsync(ct);

            var partRequestMap = linkedPartRequests
                .GroupBy(r => r.PoLineId!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            var lineDtos = po.Lines.Select(line =>
            {
                partRequestMap.TryGetValue(line.Id, out var linkedReq);
                return new PurchaseOrderLineDto(
                    line.Id,
                    line.PurchaseOrderId,
                    line.PartSku,
                    line.OemCode,
                    line.PartDescription,
                    line.OrderedQuantity,
                    line.ReceivedQuantity,
                    line.UnitPrice,
                    line.UnitPrice * line.OrderedQuantity,
                    line.Status,
                    linkedReq?.Id,
                    linkedReq?.WorkOrder?.WorkOrderNumber,
                    linkedReq?.WorkOrder?.Asset?.PrimaryIdentifier
                );
            }).ToList();

            var totalOrdered = lineDtos.Sum(l => l.OrderedQuantity);
            var totalReceived = lineDtos.Sum(l => l.ReceivedQuantity);

            var dto = new PurchaseOrderDto(
                po.Id,
                po.TenantId,
                po.BranchId,
                po.PoNumber,
                po.SupplierName,
                po.SupplierTaxNo,
                po.Status,
                po.TotalAmount,
                totalOrdered,
                totalReceived,
                po.CreatedAt,
                lineDtos
            );

            return Results.Ok(dto);
        })
        .WithName("GetPurchaseOrderById")
        .WithSummary("Tek Satınalma Siparişi Detayı");

        // 3. Create Consolidated Purchase Order (1:N Lines)
        group.MapPost("/", async (CreatePurchaseOrderRequest request, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;
            var branchId = request.BranchId ?? tenantContext.BranchId ?? DefaultBranchId;

            if (string.IsNullOrWhiteSpace(request.SupplierName))
            {
                return Results.BadRequest(new { error = "Tedarikçi adı (SupplierName) zorunludur." });
            }

            if (request.Lines == null || request.Lines.Count == 0)
            {
                return Results.BadRequest(new { error = "Siparişte en az 1 parça kalemi (line) bulunmalıdır." });
            }

            // Generate PO number
            var count = await db.PurchaseOrders.CountAsync(ct);
            var poNumber = $"PO-2026-{(1000 + count + 1):D4}";

            var poStatus = PoStatus.Ordered;
            if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<PoStatus>(request.Status, true, out var parsedStatus))
            {
                poStatus = parsedStatus;
            }

            var totalAmount = request.Lines.Sum(l => l.UnitPrice * l.OrderedQuantity);

            var po = new PurchaseOrder
            {
                TenantId = tenantId,
                BranchId = branchId,
                PoNumber = poNumber,
                SupplierName = request.SupplierName.Trim(),
                SupplierTaxNo = request.SupplierTaxNo?.Trim(),
                Status = poStatus,
                TotalAmount = totalAmount,
                CreatedAt = DateTimeOffset.UtcNow
            };

            db.PurchaseOrders.Add(po);

            var createdLineDtos = new List<PurchaseOrderLineDto>();

            foreach (var lineReq in request.Lines)
            {
                var poLine = new PurchaseOrderLine
                {
                    TenantId = tenantId,
                    PurchaseOrderId = po.Id,
                    PartSku = lineReq.PartSku.Trim(),
                    OemCode = lineReq.OemCode?.Trim(),
                    PartDescription = lineReq.PartDescription.Trim(),
                    OrderedQuantity = lineReq.OrderedQuantity,
                    ReceivedQuantity = 0,
                    UnitPrice = lineReq.UnitPrice,
                    Status = "Pending"
                };

                db.PurchaseOrderLines.Add(poLine);

                // If linked to a WorkOrderPartRequest, link them
                string? linkedWoNumber = null;
                string? linkedPlate = null;

                if (lineReq.WorkOrderPartRequestId.HasValue)
                {
                    var partReq = await db.WorkOrderPartRequests
                        .Include(r => r.WorkOrder)
                        .ThenInclude(w => w!.Asset)
                        .FirstOrDefaultAsync(r => r.Id == lineReq.WorkOrderPartRequestId.Value, ct);

                    if (partReq != null)
                    {
                        partReq.PoLineId = poLine.Id;
                        partReq.Status = "Ordered";
                        linkedWoNumber = partReq.WorkOrder?.WorkOrderNumber;
                        linkedPlate = partReq.WorkOrder?.Asset?.PrimaryIdentifier;
                    }
                }

                createdLineDtos.Add(new PurchaseOrderLineDto(
                    poLine.Id,
                    po.Id,
                    poLine.PartSku,
                    poLine.OemCode,
                    poLine.PartDescription,
                    poLine.OrderedQuantity,
                    0,
                    poLine.UnitPrice,
                    poLine.UnitPrice * poLine.OrderedQuantity,
                    poLine.Status,
                    lineReq.WorkOrderPartRequestId,
                    linkedWoNumber,
                    linkedPlate
                ));
            }

            // Transactional Outbox Event
            var outbox = new OutboxEvent
            {
                TenantId = tenantId,
                AggregateType = "PurchaseOrder",
                AggregateId = po.Id,
                EventType = "PurchaseOrderCreatedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    po.Id,
                    po.PoNumber,
                    po.SupplierName,
                    po.TotalAmount,
                    LineCount = request.Lines.Count
                })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            var totalOrdered = createdLineDtos.Sum(l => l.OrderedQuantity);
            var resultDto = new PurchaseOrderDto(
                po.Id,
                po.TenantId,
                po.BranchId,
                po.PoNumber,
                po.SupplierName,
                po.SupplierTaxNo,
                po.Status,
                po.TotalAmount,
                totalOrdered,
                0,
                po.CreatedAt,
                createdLineDtos
            );

            return Results.Created($"/api/v1/purchase-orders/{po.Id}", resultDto);
        })
        .WithName("CreatePurchaseOrder")
        .WithSummary("Konsolide Satınalma Siparişi Oluştur (1:N)");

        // 4. Receive Purchase Order Line (Partial / Full Delivery)
        group.MapPost("/{id:guid}/lines/{lineId:guid}/receive", async (Guid id, Guid lineId, ReceivePoLineRequest request, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            var tenantId = tenantContext.TenantId ?? DefaultTenantId;

            if (request.Quantity <= 0)
            {
                return Results.BadRequest(new { error = "Teslim alınan miktar 0'dan büyük olmalıdır." });
            }

            var po = await db.PurchaseOrders
                .Include(p => p.Lines)
                .FirstOrDefaultAsync(p => p.Id == id, ct);

            if (po == null)
            {
                return Results.NotFound(new { error = "Satınalma siparişi bulunamadı." });
            }

            var line = po.Lines.FirstOrDefault(l => l.Id == lineId);
            if (line == null)
            {
                return Results.NotFound(new { error = "Sipariş satırı bulunamadı." });
            }

            if (line.ReceivedQuantity >= line.OrderedQuantity)
            {
                return Results.BadRequest(new { error = $"'{line.PartDescription}' için tüm sipariş miktarı ({line.OrderedQuantity} adet) zaten teslim alınmıştır." });
            }

            if (line.ReceivedQuantity + request.Quantity > line.OrderedQuantity)
            {
                var remaining = line.OrderedQuantity - line.ReceivedQuantity;
                return Results.BadRequest(new { error = $"Teslim alınmak istenen miktar ({request.Quantity}), kalan sipariş adedini ({remaining}) aşıyor." });
            }

            line.ReceivedQuantity += request.Quantity;

            if (line.ReceivedQuantity >= line.OrderedQuantity)
            {
                line.Status = "Received";
            }
            else if (line.ReceivedQuantity > 0)
            {
                line.Status = "PartiallyReceived";
            }

            // Update overall PO status
            var allReceived = po.Lines.All(l => l.ReceivedQuantity >= l.OrderedQuantity);
            var anyReceived = po.Lines.Any(l => l.ReceivedQuantity > 0);

            if (allReceived)
            {
                po.Status = PoStatus.Completed;
            }
            else if (anyReceived)
            {
                po.Status = PoStatus.PartialReceived;
            }

            // Outbox Event
            var outbox = new OutboxEvent
            {
                TenantId = tenantId,
                AggregateType = "PurchaseOrder",
                AggregateId = po.Id,
                EventType = "PurchaseOrderLineReceivedEvent",
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    PoId = po.Id,
                    LineId = line.Id,
                    QuantityReceivedThisBatch = request.Quantity,
                    TotalReceived = line.ReceivedQuantity,
                    line.OrderedQuantity,
                    LineStatus = line.Status,
                    PoStatus = po.Status.ToString()
                })
            };
            db.OutboxEvents.Add(outbox);

            await db.SaveChangesAsync(ct);

            var message = line.ReceivedQuantity >= line.OrderedQuantity
                ? $"'{line.PartDescription}' için tam teslimat tamamlandı ({line.ReceivedQuantity}/{line.OrderedQuantity} adet)."
                : $"'{line.PartDescription}' için kısmi teslimat kaydedildi ({line.ReceivedQuantity}/{line.OrderedQuantity} adet).";

            var result = new ReceivePoLineResultDto(
                po.Id,
                line.Id,
                request.Quantity,
                line.ReceivedQuantity,
                line.OrderedQuantity,
                line.Status,
                po.Status,
                message
            );

            return Results.Ok(result);
        })
        .WithName("ReceivePurchaseOrderLine")
        .WithSummary("Sipariş Satırı Kısmi veya Tam Teslim Alma");
    }
}
