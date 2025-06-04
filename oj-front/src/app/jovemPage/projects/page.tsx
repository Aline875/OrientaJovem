"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

export default function ProjetosJovem() {
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
      </main>
    </div>
  );
}
