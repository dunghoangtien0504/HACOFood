"use client";

import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
      <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
        <Construction className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
      <p className="text-zinc-500 max-w-md">
        Tính năng này đang được phát triển dành riêng cho HACO Food OS. 
        Vui lòng quay lại sau trong Phase tiếp theo của dự án!
      </p>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
      >
        Quay lại
      </button>
    </div>
  );
}
