"use client";

import { useState } from "react";
import { HelpCircle, ChevronRight, Home } from "lucide-react";
import { HelpDrawer } from "./HelpDrawer";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  breadcrumbs: string[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
          <Home className="size-3" />
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb} className="flex items-center gap-2">
              <ChevronRight className="size-2.5" />
              <span className={i === breadcrumbs.length - 1 ? "text-[#1b5e20]" : ""}>{crumb}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-zinc-900">{title}</h1>
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="size-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-[#1b5e20] hover:bg-zinc-100 transition-all cursor-help"
          >
            <HelpCircle className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
      </div>

      <HelpDrawer 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        pageTitle={title} 
      />
    </div>
  );
}
