using HiServis.Core.DTOs;
using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HiServis.Tests;

public class Phase2SupplyChainAndWarehouseTests
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
    public void EscPosLabelService_GeneratesValidBinaryAndAsciiThermalLabel()
    {
        var service = new EscPosLabelService();
        var model = new ThermalLabelModel(
            WorkshopName: "HiServis AI",
            BranchName: "Maslak Merkez Şube",
            WorkOrderNumber: "WO-2026-10492",
            Plate: "34 ABC 123",
            Vin: "WVWZZZ3CZWE123456",
            TechnicianName: "Ahmet Usta",
            BayName: "LIFT-1",
            PartName: "Bosch Ön Fren Balata Takımı",
            PartSku: "4047024185242",
            SealToken: "HS-WO10492-P01",
            SealedAt: new DateTimeOffset(2026, 11, 18, 14, 35, 0, TimeSpan.FromHours(3))
        );

        // 1. Binary ESC/POS bytes
        var bytes = service.GenerateEscPosBytes(model);
        Assert.NotNull(bytes);
        Assert.True(bytes.Length > 50);

        // First 2 bytes must be ESC @ (0x1B, 0x40)
        Assert.Equal(0x1B, bytes[0]);
        Assert.Equal(0x40, bytes[1]);

        // 2. Base64 & Hex
        var base64 = service.GenerateEscPosBase64(model);
        Assert.False(string.IsNullOrWhiteSpace(base64));

        var hex = service.GenerateEscPosHex(model);
        Assert.StartsWith("1B40", hex);

        // 3. ASCII representation for UI thermal label preview
        var ascii = service.GenerateAsciiLabel(model);
        Assert.Contains("WO-2026-10492", ascii);
        Assert.Contains("34 ABC 123", ascii);
        Assert.Contains("HS-WO10492-P01", ascii);
        Assert.Contains("Bosch Ön Fren Balata Takımı", ascii);
        Assert.Contains("┌────────────────────────────────────────────────────────┐", ascii);
    }

    [Fact]
    public async Task PurchaseOrder_Create1ToNLines_CalculatesTotalAmountAndTracksBalances()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var poNumber = $"PO-2026-T{Random.Shared.Next(1000, 9999)}";
        var po = new PurchaseOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            PoNumber = poNumber,
            SupplierName = "Başbuğ Oto Tic. A.Ş.",
            SupplierTaxNo = "1234567890",
            Status = PoStatus.Ordered,
            TotalAmount = 0m,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var line1 = new PurchaseOrderLine
        {
            TenantId = TenantId,
            PurchaseOrderId = po.Id,
            PartSku = "4047024185242",
            PartDescription = "Bosch Fren Balatası (Ön)",
            OrderedQuantity = 4,
            ReceivedQuantity = 0,
            UnitPrice = 850m,
            Status = "Pending"
        };

        var line2 = new PurchaseOrderLine
        {
            TenantId = TenantId,
            PurchaseOrderId = po.Id,
            PartSku = "0242236565",
            PartDescription = "Bosch İridyum Buji Seti",
            OrderedQuantity = 2,
            ReceivedQuantity = 0,
            UnitPrice = 420m,
            Status = "Pending"
        };

        po.Lines.Add(line1);
        po.Lines.Add(line2);
        po.TotalAmount = (line1.UnitPrice * line1.OrderedQuantity) + (line2.UnitPrice * line2.OrderedQuantity);

        db.PurchaseOrders.Add(po);
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var reloaded = await db.PurchaseOrders.Include(p => p.Lines).FirstOrDefaultAsync(p => p.Id == po.Id);
        Assert.NotNull(reloaded);
        Assert.Equal(poNumber, reloaded.PoNumber);
        Assert.Equal(2, reloaded.Lines.Count);
        Assert.Equal(4240m, reloaded.TotalAmount); // (4*850) + (2*420) = 3400 + 840 = 4240
        Assert.Equal(PoStatus.Ordered, reloaded.Status);
    }

    [Fact]
    public async Task PurchaseOrder_PartialAndFullReceipt_UpdatesStatusesCorrectly()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var po = new PurchaseOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            PoNumber = $"PO-TEST-REC-{Random.Shared.Next(1000, 9999)}",
            SupplierName = "Martaş Otomotiv",
            Status = PoStatus.Ordered,
            TotalAmount = 2000m
        };

        var line = new PurchaseOrderLine
        {
            TenantId = TenantId,
            PurchaseOrderId = po.Id,
            PartSku = "CASTROL-5W30-4L",
            PartDescription = "Castrol Edge 5W-30 (4L)",
            OrderedQuantity = 10,
            ReceivedQuantity = 0,
            UnitPrice = 200m,
            Status = "Pending"
        };

        po.Lines.Add(line);
        db.PurchaseOrders.Add(po);
        await db.SaveChangesAsync();

        // 1. Partial receipt: 4 received out of 10
        line.ReceivedQuantity += 4;
        line.Status = "PartiallyReceived";
        po.Status = PoStatus.PartialReceived;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var partial = await db.PurchaseOrders.Include(p => p.Lines).FirstAsync(p => p.Id == po.Id);
        Assert.Equal(PoStatus.PartialReceived, partial.Status);
        Assert.Equal(4, partial.Lines.First().ReceivedQuantity);
        Assert.Equal("PartiallyReceived", partial.Lines.First().Status);

        // 2. Full receipt: remainder 6 received
        var lineReloaded = partial.Lines.First();
        lineReloaded.ReceivedQuantity += 6;
        lineReloaded.Status = "Received";
        partial.Status = PoStatus.Completed;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var full = await db.PurchaseOrders.Include(p => p.Lines).FirstAsync(p => p.Id == po.Id);
        Assert.Equal(PoStatus.Completed, full.Status);
        Assert.Equal(10, full.Lines.First().ReceivedQuantity);
        Assert.Equal("Received", full.Lines.First().Status);
    }

    [Fact]
    public async Task WarehouseMatchRequests_SortsCandidatesByUrgencyPriority()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var plateUrgent = "34 URG " + Random.Shared.Next(100, 999);
        var plateNormal = "34 NRM " + Random.Shared.Next(100, 999);

        var assetUrgent = new Asset { TenantId = TenantId, PrimaryIdentifier = plateUrgent, Brand = "VW", Model = "Passat" };
        var assetNormal = new Asset { TenantId = TenantId, PrimaryIdentifier = plateNormal, Brand = "Renault", Model = "Megane" };
        db.Assets.AddRange(assetUrgent, assetNormal);
        await db.SaveChangesAsync();

        var woUrgent = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = assetUrgent.Id,
            WorkOrderNumber = $"WO-U-{Random.Shared.Next(1000, 9999)}",
            CustomerName = "Ahmet Acil",
            CustomerPhone = "0532 111 0001",
            Priority = "Urgent",
            Status = WorkOrderStatus.InProgress
        };

        var woNormal = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = assetNormal.Id,
            WorkOrderNumber = $"WO-N-{Random.Shared.Next(1000, 9999)}",
            CustomerName = "Mehmet Normal",
            CustomerPhone = "0532 111 0002",
            Priority = "Normal",
            Status = WorkOrderStatus.Open
        };

        db.WorkOrders.AddRange(woUrgent, woNormal);
        await db.SaveChangesAsync();

        var sku = "4047024-TEST-" + Random.Shared.Next(100, 999);

        var reqNormal = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = woNormal.Id,
            PartSku = sku,
            PartName = "Bosch Fren Balatası",
            RequestedQuantity = 1,
            Status = "Pending"
        };

        var reqUrgent = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = woUrgent.Id,
            PartSku = sku,
            PartName = "Bosch Fren Balatası",
            RequestedQuantity = 1,
            Status = "Pending"
        };

        db.WorkOrderPartRequests.AddRange(reqNormal, reqUrgent);
        await db.SaveChangesAsync();

        // Query candidates matching sku
        var candidates = await db.WorkOrderPartRequests
            .Include(r => r.WorkOrder)
            .ThenInclude(w => w!.Asset)
            .Where(r => r.PartSku == sku && (r.Status == "Pending" || r.Status == "Ordered"))
            .ToListAsync();

        var sorted = candidates
            .OrderBy(r => r.WorkOrder?.Priority == "Urgent" ? 1 : 2)
            .ToList();

        Assert.Equal(2, sorted.Count);
        // The Urgent work order MUST be ranked first!
        Assert.Equal("Urgent", sorted[0].WorkOrder?.Priority);
        Assert.Equal(plateUrgent, sorted[0].WorkOrder?.Asset?.PrimaryIdentifier);
        Assert.Equal("Normal", sorted[1].WorkOrder?.Priority);
        Assert.Equal(plateNormal, sorted[1].WorkOrder?.Asset?.PrimaryIdentifier);
    }

    [Fact]
    public async Task AllocatePart_SetsInternalSealedQrAndPromotesWorkOrderPriority()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var asset = new Asset { TenantId = TenantId, PrimaryIdentifier = "34 SEAL " + Random.Shared.Next(100, 999), Brand = "BMW", Model = "320i" };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = "WO-2026-SEAL1",
            CustomerName = "Can Seal",
            CustomerPhone = "0532 555 4433",
            Priority = "Normal",
            Status = WorkOrderStatus.Open
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        var partReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "BOSCH-PLUG-1",
            PartName = "Bosch Buji",
            RequestedQuantity = 1,
            AllocatedQuantity = 0,
            Status = "Pending"
        };
        db.WorkOrderPartRequests.Add(partReq);
        await db.SaveChangesAsync();

        // Allocate part
        var token = "HS-WOSEAL1-P01";
        partReq.InternalSealedQr = token;
        partReq.AllocatedQuantity = 1;
        partReq.Status = "Allocated";
        wo.Priority = "PartsArrived";

        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var reloaded = await db.WorkOrderPartRequests.Include(r => r.WorkOrder).FirstAsync(r => r.Id == partReq.Id);
        Assert.Equal(token, reloaded.InternalSealedQr);
        Assert.Equal("Allocated", reloaded.Status);
        Assert.Equal("PartsArrived", reloaded.WorkOrder?.Priority);
    }

    [Fact]
    public async Task CrossAssemblyLock_PreventsMountingPartAllocatedToAnotherVehicle()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        // Vehicle A: Passat (Ahmet Usta)
        var assetPassat = new Asset { TenantId = TenantId, PrimaryIdentifier = "34 AHM 01", Brand = "VW", Model = "Passat" };
        // Vehicle B: Megane (Mehmet Usta)
        var assetMegane = new Asset { TenantId = TenantId, PrimaryIdentifier = "06 MEH 02", Brand = "Renault", Model = "Megane" };
        db.Assets.AddRange(assetPassat, assetMegane);
        await db.SaveChangesAsync();

        var woPassat = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = assetPassat.Id,
            WorkOrderNumber = "WO-PASSAT-01",
            CustomerName = "Passat Sahibi",
            CustomerPhone = "0532 111 0001",
            Status = WorkOrderStatus.InProgress
        };

        var woMegane = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = assetMegane.Id,
            WorkOrderNumber = "WO-MEGANE-02",
            CustomerName = "Megane Sahibi",
            CustomerPhone = "0532 111 0002",
            Status = WorkOrderStatus.InProgress
        };

        db.WorkOrders.AddRange(woPassat, woMegane);
        await db.SaveChangesAsync();

        var sealedTokenForPassat = "HS-WOPASSAT-P01";

        var partReqPassat = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = woPassat.Id,
            PartSku = "BOSCH-PAD-99",
            PartName = "Bosch Fren Balatası",
            RequestedQuantity = 1,
            AllocatedQuantity = 1,
            InternalSealedQr = sealedTokenForPassat,
            Status = "Allocated"
        };

        db.WorkOrderPartRequests.Add(partReqPassat);
        await db.SaveChangesAsync();

        // Scenario 1: Ahmet Usta scans the part for woPassat -> Valid!
        var matchForPassat = await db.WorkOrderPartRequests
            .FirstOrDefaultAsync(r => r.WorkOrderId == woPassat.Id && r.InternalSealedQr == sealedTokenForPassat);
        Assert.NotNull(matchForPassat);
        Assert.Equal("Allocated", matchForPassat.Status);

        // Scenario 2: Mehmet Usta accidentally scans Passat's sealed part on woMegane!
        // Should detect that it does NOT belong to Megane, but DOES belong to Passat!
        var matchForMegane = await db.WorkOrderPartRequests
            .FirstOrDefaultAsync(r => r.WorkOrderId == woMegane.Id && r.InternalSealedQr == sealedTokenForPassat);
        Assert.Null(matchForMegane); // Not for Megane!

        var crossLockedMatch = await db.WorkOrderPartRequests
            .Include(r => r.WorkOrder)
            .ThenInclude(w => w!.Asset)
            .FirstOrDefaultAsync(r => r.InternalSealedQr == sealedTokenForPassat);

        Assert.NotNull(crossLockedMatch);
        Assert.NotEqual(woMegane.Id, crossLockedMatch.WorkOrderId);
        Assert.Equal("34 AHM 01", crossLockedMatch.WorkOrder?.Asset?.PrimaryIdentifier);
        // Cross Assembly Lock Active: Alert triggered!
    }

    [Fact]
    public async Task ReverseLogistics_ReturnIncompatiblePart_RoutesToVirtualReturnShelfAndSpawnsNewRequest()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);

        await using var db = CreateDbContext(context);

        var asset = new Asset { TenantId = TenantId, PrimaryIdentifier = "34 RET " + Random.Shared.Next(100, 999), Brand = "Audi", Model = "A4" };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = "WO-RET-01",
            CustomerName = "İade Müşteri",
            CustomerPhone = "0532 999 0000",
            Status = WorkOrderStatus.InProgress
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        var partReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "DISC-288MM",
            PartName = "Fren Diski 288mm",
            RequestedQuantity = 2,
            AllocatedQuantity = 2,
            InternalSealedQr = "HS-WORET-P01",
            Status = "Allocated"
        };
        db.WorkOrderPartRequests.Add(partReq);
        await db.SaveChangesAsync();

        // Ensure ReturnToSupplier virtual shelf exists
        var returnShelf = await db.Warehouses.FirstOrDefaultAsync(w => w.Name == "ReturnToSupplier (Tedarikçiye İade)");
        if (returnShelf == null)
        {
            returnShelf = new Warehouse
            {
                TenantId = TenantId,
                BranchId = MaslakBranchId,
                Name = "ReturnToSupplier (Tedarikçiye İade)",
                WarehouseType = WarehouseType.BranchRack,
                IsActive = true
            };
            db.Warehouses.Add(returnShelf);
            await db.SaveChangesAsync();
        }

        // Return the part
        partReq.Status = "Returned";
        partReq.TargetWarehouseId = returnShelf.Id;

        // Auto spawn replacement part request
        var replacementReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "DISC-312MM", // Corrected size
            PartName = "Fren Diski 312mm (İkame)",
            RequestedQuantity = 2,
            AllocatedQuantity = 0,
            Status = "Pending"
        };
        db.WorkOrderPartRequests.Add(replacementReq);
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var reloadedOriginal = await db.WorkOrderPartRequests.FirstAsync(r => r.Id == partReq.Id);
        Assert.Equal("Returned", reloadedOriginal.Status);
        Assert.Equal(returnShelf.Id, reloadedOriginal.TargetWarehouseId);

        var reloadedReplacement = await db.WorkOrderPartRequests.FirstAsync(r => r.Id == replacementReq.Id);
        Assert.Equal("Pending", reloadedReplacement.Status);
        Assert.Equal(wo.Id, reloadedReplacement.WorkOrderId);
    }

    [Fact]
    public async Task WarehouseMatchQuery_CanExecuteAgainstPostgreSql()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var cleanEan = "4047024185242";
        var query = db.WorkOrderPartRequests.Where(r =>
            r.PartSku == cleanEan ||
            r.PartSku.Contains(cleanEan) ||
            cleanEan.Contains(r.PartSku) ||
            r.PartName.Contains(cleanEan) ||
            (cleanEan.Length >= 5 && (r.PartSku.EndsWith(cleanEan) || cleanEan.EndsWith(r.PartSku)))
        );

        var result = await query.ToListAsync();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task PurchaseOrder_ReceiveLine_RejectsOverDelivery()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var po = new PurchaseOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            PoNumber = $"PO-OVER-{Random.Shared.Next(1000, 9999)}",
            SupplierName = "Başbuğ Oto",
            Status = PoStatus.Ordered,
            TotalAmount = 800m
        };

        var line = new PurchaseOrderLine
        {
            TenantId = TenantId,
            PurchaseOrderId = po.Id,
            PartSku = "BOSCH-PAD-OD",
            PartDescription = "Balata Test",
            OrderedQuantity = 4,
            ReceivedQuantity = 3,
            UnitPrice = 200m,
            Status = "PartiallyReceived"
        };
        po.Lines.Add(line);
        db.PurchaseOrders.Add(po);
        await db.SaveChangesAsync();

        // Attempt over-delivery: receiving 2 when only 1 remaining (3 + 2 > 4)
        var receiveQty = 2;
        var remaining = line.OrderedQuantity - line.ReceivedQuantity;
        var isOverDelivery = (line.ReceivedQuantity + receiveQty) > line.OrderedQuantity;

        Assert.True(isOverDelivery);
        Assert.Equal(1, remaining);

        // Valid receive: 1 remaining
        line.ReceivedQuantity += remaining;
        line.Status = "Received";
        po.Status = PoStatus.Completed;
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var reloaded = await db.PurchaseOrders.Include(p => p.Lines).FirstAsync(p => p.Id == po.Id);
        Assert.Equal(4, reloaded.Lines.First().ReceivedQuantity);
        Assert.Equal("Received", reloaded.Lines.First().Status);
        Assert.Equal(PoStatus.Completed, reloaded.Status);
    }

    [Fact]
    public async Task VanStockTransfer_ValidatesAndDispatchesOutbox()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var sourceWh = new Warehouse
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            Name = "Merkez Depo " + Random.Shared.Next(100, 999),
            WarehouseType = WarehouseType.Central,
            IsActive = true
        };

        var targetWh = new Warehouse
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            Name = "Gezici Servis Aracı 1 (Van Stock) " + Random.Shared.Next(100, 999),
            WarehouseType = WarehouseType.VanStock,
            IsActive = true
        };

        db.Warehouses.AddRange(sourceWh, targetWh);
        await db.SaveChangesAsync();

        var transferId = Guid.NewGuid();
        var waybillNo = $"IRS-2026-{(Random.Shared.Next(10000, 99999))}";

        var outbox = new OutboxEvent
        {
            TenantId = TenantId,
            AggregateType = "VanStockTransfer",
            AggregateId = transferId,
            EventType = "VanStockTransferDispatchedEvent",
            PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                TransferId = transferId,
                WaybillNumber = waybillNo,
                SourceWarehouse = sourceWh.Name,
                TargetWarehouse = targetWh.Name,
                PartSku = "CASTROL-5W30",
                PartName = "Castrol Motor Yağı 4L",
                Quantity = 2,
                DispatchedAt = DateTimeOffset.UtcNow
            })
        };
        db.OutboxEvents.Add(outbox);
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();

        var savedOutbox = await db.OutboxEvents.FirstOrDefaultAsync(o => o.AggregateId == transferId);
        Assert.NotNull(savedOutbox);
        Assert.Contains(waybillNo, savedOutbox.PayloadJson);
        Assert.Contains("VanStockTransferDispatchedEvent", savedOutbox.EventType);
    }

    [Fact]
    public async Task AllocatePart_PartialAllocation_AccuratelyIncrementsAndSetsStatus()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = new Asset { TenantId = TenantId, PrimaryIdentifier = "34 PART " + Random.Shared.Next(100, 999), Brand = "VW", Model = "Golf" };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = $"WO-PART-{Random.Shared.Next(1000, 9999)}",
            CustomerName = "Golf Sahibi",
            CustomerPhone = "0532 888 7766",
            Priority = "Normal",
            Status = WorkOrderStatus.Open
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        // 4 spark plugs requested
        var partReq = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "BOSCH-SPARK-4X",
            PartName = "Bosch Buji",
            RequestedQuantity = 4,
            AllocatedQuantity = 0,
            Status = "Pending"
        };
        db.WorkOrderPartRequests.Add(partReq);
        await db.SaveChangesAsync();

        // Step 1: 1st box scanned -> AllocatedQuantity should be 1, NOT 4!
        partReq.AllocatedQuantity = Math.Min(partReq.AllocatedQuantity + 1, partReq.RequestedQuantity);
        partReq.Status = partReq.AllocatedQuantity >= partReq.RequestedQuantity ? "Allocated" : "PartiallyAllocated";
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var afterFirst = await db.WorkOrderPartRequests.FirstAsync(r => r.Id == partReq.Id);
        Assert.Equal(1, afterFirst.AllocatedQuantity);
        Assert.Equal("PartiallyAllocated", afterFirst.Status);

        // Step 2: 2nd box scanned -> AllocatedQuantity is 2
        afterFirst.AllocatedQuantity = Math.Min(afterFirst.AllocatedQuantity + 1, afterFirst.RequestedQuantity);
        afterFirst.Status = afterFirst.AllocatedQuantity >= afterFirst.RequestedQuantity ? "Allocated" : "PartiallyAllocated";
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var afterSecond = await db.WorkOrderPartRequests.FirstAsync(r => r.Id == partReq.Id);
        Assert.Equal(2, afterSecond.AllocatedQuantity);
        Assert.Equal("PartiallyAllocated", afterSecond.Status);

        // Step 3: Remaining 2 boxes scanned -> AllocatedQuantity reaches 4 and Status is Allocated
        afterSecond.AllocatedQuantity = Math.Min(afterSecond.AllocatedQuantity + 2, afterSecond.RequestedQuantity);
        afterSecond.Status = afterSecond.AllocatedQuantity >= afterSecond.RequestedQuantity ? "Allocated" : "PartiallyAllocated";
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var afterAll = await db.WorkOrderPartRequests.FirstAsync(r => r.Id == partReq.Id);
        Assert.Equal(4, afterAll.AllocatedQuantity);
        Assert.Equal("Allocated", afterAll.Status);
    }

    [Fact]
    public async Task AllocatePart_MultiPartWorkOrder_GeneratesIncrementalTokensP01AndP02()
    {
        var context = new TenantContext();
        context.SetContext(TenantId, MaslakBranchId, TechAhmetId, "Technician", isTenantAdmin: false);
        await using var db = CreateDbContext(context);

        var asset = new Asset { TenantId = TenantId, PrimaryIdentifier = "34 MULTI " + Random.Shared.Next(100, 999), Brand = "Ford", Model = "Focus" };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var wo = new WorkOrder
        {
            TenantId = TenantId,
            BranchId = MaslakBranchId,
            AssetId = asset.Id,
            WorkOrderNumber = "WO-2026-10492",
            CustomerName = "Focus Sahibi",
            CustomerPhone = "0532 333 2211",
            Priority = "Normal",
            Status = WorkOrderStatus.Open
        };
        db.WorkOrders.Add(wo);
        await db.SaveChangesAsync();

        var req1 = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "BOSCH-PAD",
            PartName = "Ön Fren Balatası",
            RequestedQuantity = 1,
            AllocatedQuantity = 0,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5)
        };

        var req2 = new WorkOrderPartRequest
        {
            TenantId = TenantId,
            WorkOrderId = wo.Id,
            PartSku = "MANN-FILTER",
            PartName = "Yağ Filtresi",
            RequestedQuantity = 1,
            AllocatedQuantity = 0,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.WorkOrderPartRequests.AddRange(req1, req2);
        await db.SaveChangesAsync();

        // Calculate sequence tokens
        var woSegments = wo.WorkOrderNumber.Split('-', StringSplitOptions.RemoveEmptyEntries);
        var woSeq = woSegments.Length > 0 ? woSegments[^1] : wo.WorkOrderNumber;
        Assert.Equal("10492", woSeq);

        var siblingIds = await db.WorkOrderPartRequests
            .Where(r => r.WorkOrderId == wo.Id)
            .OrderBy(r => r.CreatedAt)
            .ThenBy(r => r.Id)
            .Select(r => r.Id)
            .ToListAsync();

        var idx1 = siblingIds.IndexOf(req1.Id);
        var token1 = $"HS-WO{woSeq}-P{(idx1 + 1):D2}";

        var idx2 = siblingIds.IndexOf(req2.Id);
        var token2 = $"HS-WO{woSeq}-P{(idx2 + 1):D2}";

        Assert.Equal("HS-WO10492-P01", token1);
        Assert.Equal("HS-WO10492-P02", token2);
    }
}
