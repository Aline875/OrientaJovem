"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import React from "react";



export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570]">
      <Header />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 pt-20 lg:ml-4">
         
        </main>
      </div>
    </div>
  );
}
