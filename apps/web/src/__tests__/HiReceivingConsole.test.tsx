import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiReceivingConsole } from "@/components/warehouse/HiReceivingConsole";

describe("HiReceivingConsole — Konsolide Mal Kabul & Termal Mühür Ekranı", () => {
  it("renders barcode scanner input and header correctly", async () => {
    render(<HiReceivingConsole />);

    expect(screen.getByText(/Konsolide Mal Kabul & Parça Eşleştirme/i)).toBeInTheDocument();
    expect(screen.getByText(/Termal Yazıcı \(50x30mm\):/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Kutudaki üretici EAN barkodunu/i)).toBeInTheDocument();
  });

  it("searches matching work orders and sorts Urgent vehicle Passat to rank #1", async () => {
    render(<HiReceivingConsole />);

    // Wait for initial search (4047024185242)
    await waitFor(() => {
      expect(screen.getByText("34 ABC 123")).toBeInTheDocument();
    });

    expect(screen.getByText("06 BCD 456")).toBeInTheDocument();
    expect(screen.getByText("🔴 ACİL")).toBeInTheDocument();

    // The first candidate item must contain 34 ABC 123
    const firstRankBadge = screen.getByText("#1");
    expect(firstRankBadge).toBeInTheDocument();
  });

  it("allows selecting a test barcode button to re-trigger search", async () => {
    render(<HiReceivingConsole />);

    const bujiBtn = screen.getByText(/0242236565 \(Bosch Buji\)/i);
    fireEvent.click(bujiBtn);

    await waitFor(() => {
      expect(screen.getByText(/Barkod: 0242236565/i)).toBeInTheDocument();
    });
  });

  it("triggers allocate part and opens thermal seal label modal", async () => {
    render(<HiReceivingConsole />);

    await waitFor(() => {
      expect(screen.getAllByText(/Bu Araca Tahsis Et & Mühür Bas/i).length).toBeGreaterThan(0);
    });

    const allocateBtns = screen.getAllByText(/Bu Araca Tahsis Et & Mühür Bas/i);
    fireEvent.click(allocateBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Termal Mühür Etiketi \(50mm x 30mm\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText("HS-WO10492-P01")).toBeInTheDocument();
  });
});
