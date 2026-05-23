"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 flex">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile backdrop — tapping outside closes the sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 md:ml-[280px] has-[aside.w-\[88px\]]:md:ml-[88px]">
        <Topbar onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)} />
        <main className="flex-1 p-4 md:p-8 transition-all duration-300">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
