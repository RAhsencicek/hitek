import { describe, it, expect } from "vitest";
import { apiClient } from "@/lib/api";

describe("apiClient — Faz 2: Tedarik Zinciri & Mühürlü Mal Kabul", () => {
  it("matches warehouse requests for EAN 4047024185242 with urgent vehicle ranked #1", async () => {
    const candidates = await apiClient.matchWarehouseRequests("4047024185242");
    expect(candidates.length).toBe(2);

    expect(candidates[0].plate).toBe("34 ABC 123");
    expect(candidates[0].priority).toBe("Urgent");
    expect(candidates[0].isUrgent).toBe(true);

    expect(candidates[1].plate).toBe("06 BCD 456");
    expect(candidates[1].priority).toBe("Normal");
  });

  it("allocates part and generates thermal label and ESC/POS payload", async () => {
    const res = await apiClient.allocatePart({
      partRequestId: "req-passat-1",
      scannedBarcode: "4047024185242",
      printLabelImmediately: true,
    });

    expect(res.internalSealedQr).toBe("HS-WO10492-P01");
    expect(res.plate).toBe("34 ABC 123");
    expect(res.thermalLabelText).toContain("HS-WO10492-P01");
    expect(res.thermalLabelText).toContain("34 ABC 123");
    expect(res.escPosPayloadBase64).toBeTruthy();
  });

  it("verifies installation for correct work order", async () => {
    const res = await apiClient.verifyPartInstallation({
      workOrderId: "wo-10492",
      scannedQr: "HS-WO10492-P01",
    });

    expect(res.isValid).toBe(true);
    expect(res.isCrossAssemblyLocked).toBe(false);
    expect(res.message).toContain("Mühür Doğrulandı");
  });

  it("triggers cross-assembly lock when scanned on wrong work order", async () => {
    const res = await apiClient.verifyPartInstallation({
      workOrderId: "wo-other-999",
      scannedQr: "HS-WO10492-P01",
    });

    expect(res.isValid).toBe(false);
    expect(res.isCrossAssemblyLocked).toBe(true);
    expect(res.allocatedToPlate).toBe("34 ABC 123");
    expect(res.message).toContain("34 ABC 123 plakalı araca aittir");
  });

  it("returns incompatible part to ReturnToSupplier shelf", async () => {
    const res = await apiClient.returnPart({
      partRequestId: "req-passat-1",
      reason: "Boyut Uyumsuz",
      notes: "312mm disk yerine 288mm geldi",
      requestNewPart: true,
    });

    expect(res.success).toBe(true);
    expect(res.returnShelf).toContain("ReturnToSupplier");
    expect(res.newPartRequestId).toBeTruthy();
  });

  it("fetches purchase orders and handles partial delivery", async () => {
    const pos = await apiClient.getPurchaseOrders();
    expect(pos.length).toBeGreaterThan(0);

    const firstPo = pos[0];
    expect(firstPo.poNumber).toBe("PO-2026-1001");
    expect(firstPo.lines.length).toBeGreaterThan(0);

    const line = firstPo.lines[0];
    const recRes = await apiClient.receivePoLine(firstPo.id, line.id, 1);
    expect(recRes.quantityReceivedThisBatch).toBe(1);
  });

  it("creates consolidated purchase order", async () => {
    const created = await apiClient.createPurchaseOrder({
      supplierName: "Başbuğ Oto",
      lines: [
        {
          partSku: "BOSCH-PAD",
          partDescription: "Fren Balatası",
          orderedQuantity: 2,
          unitPrice: 500,
        },
      ],
    });

    expect(created.poNumber).toMatch(/^PO-2026-/);
    expect(created.totalAmount).toBe(1000);
    expect(created.lines.length).toBe(1);
  });

  it("handles van stock mobile warehouse transfer", async () => {
    const transfer = await apiClient.vanStockTransfer({
      sourceWarehouseId: "wh-central",
      targetWarehouseId: "wh-van-1",
      partSku: "CASTROL-5W30",
      partName: "Castrol Motor Yağı",
      quantity: 5,
    });

    expect(transfer.success).toBe(true);
    expect(transfer.waybillNumber).toMatch(/^IRS-2026-/);
  });
});
