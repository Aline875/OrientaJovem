"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-black">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 space-y-10">
        <AppSidebar />
      </main>
    </div>
  );
}
