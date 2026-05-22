"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We'll manage the sidebar width state here if we want perfectly synced transitions,
  // but for now let's just use the standard layout. 
  // I will remove the fixed ml-[240px] and use a container that responds to the fixed sidebar.

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 md:ml-[280px] has-[aside.w-\[88px\]]:md:ml-[88px]">
        <Topbar />
        <main className="flex-1 p-8 transition-all duration-300">
          <div className="mx-auto max-w-[1600px] animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
