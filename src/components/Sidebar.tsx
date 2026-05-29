"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  AppWindow,
  Target,
  Radar,
  GanttChart,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Navigation Items ────────────────────────────────────────────────────────

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/capabilities", label: "Capabilities", icon: Layers },
  { href: "/applications", label: "Applications", icon: AppWindow },
  { href: "/strategy", label: "Strategy", icon: Target },
  { href: "/radar", label: "Tech Radar", icon: Radar },
  { href: "/roadmap", label: "Roadmap", icon: GanttChart },
  { href: "/search", label: "Search", icon: Search },
];

// ── Sidebar Component ───────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-rosely-blush bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-rosely-blush px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-rosely-plum">VantageMap</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="flex w-full items-center justify-center">
            <span className="font-serif text-lg font-bold text-rosely-plum">V</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-rosely-petal text-rosely-plum"
                  : "text-rosely-dusk hover:bg-rosely-petal/50 hover:text-rosely-night"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-rosely-blush p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-rosely-mist hover:bg-rosely-petal/50 hover:text-rosely-night transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
