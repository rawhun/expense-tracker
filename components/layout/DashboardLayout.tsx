"use client";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 flex flex-col md:pl-64">
        <div className="flex-1 p-4 pb-24 md:p-8 md:pb-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
