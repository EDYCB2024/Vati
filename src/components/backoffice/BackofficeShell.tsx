"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/backoffice",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/backoffice/casos",
    label: "Lista de Casos",
    icon: Inbox,
    exact: false,
  },
  {
    href: "/backoffice/conocimiento",
    label: "Base de Conocimiento",
    icon: BookOpen,
    exact: false,
  },
];

function BackofficeNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0",
                active
                  ? "vati-gradient text-white shadow-xs"
                  : "bg-surface-container-low text-on-surface-variant hover:text-primary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
              active
                ? "bg-surface-container-lowest text-primary ambient-shadow-sm translate-x-0.5"
                : "text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function BackofficeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col lg:flex-row">
      {/* Mobile & Tablet Compact Sticky Header (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-[0_4px_20px_rgba(58,56,139,0.06)] space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl vati-gradient flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-headline font-extrabold text-sm text-on-surface leading-none truncate">
                Vati Concierge
              </h2>
              <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">
                Backoffice de Agentes
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold vati-gradient text-white shrink-0"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Chat Vati</span>
          </Link>
        </div>

        <Suspense fallback={<div className="h-9" />}>
          <BackofficeNav mobile />
        </Suspense>
      </header>

      {/* Desktop Floating Glass Sidebar (lg+) */}
      <aside className="hidden lg:block lg:w-72 lg:shrink-0 p-4 lg:sticky lg:top-0 lg:h-dvh">
        <div className="glass-panel ambient-shadow rounded-3xl h-full p-5 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 px-2 mb-8">
              <div className="w-10 h-10 rounded-2xl vati-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-base text-on-surface leading-none">
                  Vati Concierge
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Backoffice de Agentes
                </p>
              </div>
            </div>

            <Suspense fallback={<div className="h-24" />}>
              <BackofficeNav />
            </Suspense>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-xs font-semibold vati-gradient text-white hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <MessageSquareText className="w-4 h-4" />
              Abrir Chat de Vati (Cliente)
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 lg:pl-4">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
