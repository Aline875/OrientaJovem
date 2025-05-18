"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-black">
      <Header />
      <AppSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 space-y-10 pt-16 lg:ml-16">
        {/* Seu conteúdo principal aqui */}
      </main>
    </div>
  );
}