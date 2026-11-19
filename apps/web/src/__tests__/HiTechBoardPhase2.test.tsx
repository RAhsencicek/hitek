import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiTechBoard } from "@/components/techboard/HiTechBoard";

describe("HiTechBoard — Faz 2: Mühür Doğrulama, Çapraz Montaj Kilidi & İade", () => {
  it("renders the sealed part card per Component Catalogue 4.1", () => {
    render(<HiTechBoard />);

    expect(screen.getByText("BOSCH ÖN FREN BALATASI")).toBeInTheDocument();
    expect(screen.getByText("HS-WO10492-P01")).toBeInTheDocument();
    expect(screen.getByText(/OEM: 5Q0 698 151 B • Tedarikçi: Başbuğ Oto/i)).toBeInTheDocument();
    expect(screen.getByText("Mühür Doğrula (QR)")).toBeInTheDocument();
    expect(screen.getByText("⚠️ Uyumsuz / İade")).toBeInTheDocument();
  });

  it("verifies matching QR seal and confirms installation", async () => {
    render(<HiTechBoard />);

    const verifyBtn = screen.getByText("Mühür Doğrula (QR)");
    fireEvent.click(verifyBtn);

    expect(screen.getByText("Mühür QR Kodu Doğrula")).toBeInTheDocument();

    const confirmBtn = screen.getByText(/🟢 Doğru Mühür \(34 ABC 123 Passat\)/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Mühür Doğrulandı: Bu parça sizin aracınız içindir/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Durum: \[ MONTE EDİLDİ \]/i)).toBeInTheDocument();
    expect(screen.getByText(/📸 Parça Montaj Fotoğrafı Çek/i)).toBeInTheDocument();
  });

  it("triggers Cross-Assembly Lock when scanning a part belonging to another vehicle", async () => {
    render(<HiTechBoard />);

    const verifyBtn = screen.getByText("Mühür Doğrula (QR)");
    fireEvent.click(verifyBtn);

    const wrongPartBtn = screen.getByText(/🔴 Yanlış Araç Mührü \(Çapraz Kilit Tetikle\)/i);
    fireEvent.click(wrongPartBtn);

    await waitFor(() => {
      expect(screen.getByText(/Çapraz Montaj Kilidi Devrede!/i)).toBeInTheDocument();
    });
  });

  it("handles incompatible part return flow (reverse logistics)", async () => {
    render(<HiTechBoard />);

    const returnBtn = screen.getByText("⚠️ Uyumsuz / İade");
    fireEvent.click(returnBtn);

    expect(screen.getByText("Uyumsuz Parça / İade Akışı")).toBeInTheDocument();
    expect(screen.getByText(/ReturnToSupplier/i)).toBeInTheDocument();

    const submitReturnBtn = screen.getByText("İadeyi Tamamla");
    fireEvent.click(submitReturnBtn);

    await waitFor(() => {
      expect(screen.getByText(/Uyumsuz parça iş emrinden düşüldü/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Durum: \[ İADE EDİLDİ \]/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /İade Edildi/i })).toBeDisabled();
  });
});
