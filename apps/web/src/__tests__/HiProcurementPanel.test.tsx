import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiProcurementPanel } from "@/components/procurement/HiProcurementPanel";

describe("HiProcurementPanel — Satınalma & Tedarikçi Sipariş Paneli", () => {
  it("renders procurement panel header and supplier selector", async () => {
    render(<HiProcurementPanel />);

    expect(screen.getByText(/Tedarikçi Sipariş & Satınalma Havuzu \(PO\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1:N Konsolide Sepet/i)).toBeInTheDocument();
  });

  it("loads pending requests and allows consolidating them into a PO", async () => {
    render(<HiProcurementPanel />);

    // Wait until pending requests are loaded and preselected (2 requests)
    await waitFor(() => {
      expect(screen.getByText(/Seçilenleri Sepete At & Sipariş Ver \(2\)/i)).toBeInTheDocument();
    });

    const consolidateBtn = screen.getByText(/Seçilenleri Sepete At & Sipariş Ver \(2\)/i);
    fireEvent.click(consolidateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Toptancı Sipariş Mektubu \(WhatsApp & PDF\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/WhatsApp Mesajını Kopyala/i)).toBeInTheDocument();
  });

  it("displays existing purchase orders and receives partial delivery quantity", async () => {
    render(<HiProcurementPanel />);

    await waitFor(() => {
      expect(screen.getByText("#PO-2026-1001")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Başbuğ Oto Tic. A.Ş.").length).toBeGreaterThan(0);
    expect(screen.getByText("Kısmi Teslimat")).toBeInTheDocument();

    const receiveBtn = screen.getAllByText(/Teslim Al \(\+1\)/i)[0];
    fireEvent.click(receiveBtn);

    await waitFor(() => {
      // Delivered quantity increases to 3 / 4 Adet
      expect(screen.getByText(/3 \/ 4 Adet/i)).toBeInTheDocument();
    });
  });

  it("opens WhatsApp letter modal when button is clicked", async () => {
    render(<HiProcurementPanel />);

    await waitFor(() => {
      expect(screen.getAllByText(/WhatsApp \/ PDF Mektubu/i).length).toBeGreaterThan(0);
    });

    const exportBtn = screen.getAllByText(/WhatsApp \/ PDF Mektubu/i)[0];
    fireEvent.click(exportBtn);

    expect(screen.getByText(/Toptancı Sipariş Mektubu \(WhatsApp & PDF\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/HiServis AI/i).length).toBeGreaterThan(0);
  });
});
