"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";


export default function PerfilJovem() {
 
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 px-6 py-10 text-white mt-18">
          
        </main>
      </div>
    </div>
  );
}
