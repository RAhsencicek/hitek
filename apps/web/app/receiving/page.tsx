"use client";

import React from "react";
import Link from "next/link";
import { HiReceivingConsole } from "@/components/warehouse/HiReceivingConsole";
import { ArrowLeft, Barcode, ShoppingCart } from "lucide-react";

export default function ReceivingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-blue-600" />
              <h1 className="font-black text-lg tracking-tight">Konsolide Mal Kabul &amp; Termal Mühür</h1>
            </div>
          </div>

          <Link
            href="/procurement"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Satınalma Siparişleri (PO)</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HiReceivingConsole />
      </main>
    </div>
  );
}
