"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  AppWindow,
  Target,
  RadioTower,
  CalendarRange,
  Map,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/capabilities", label: "Capabilities", icon: Map },
  { href: "/applications", label: "Applications", icon: AppWindow },
  { href: "/strategy", label: "Strategy Map", icon: Target },
  { href: "/radar", label: "Tech Radar", icon: RadioTower },
  { href: "/roadmap", label: "Roadmap", icon: CalendarRange },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-rosely-night text-rosely-petal flex flex-col">
      {/* Logo / brand */}
      <div className="px-6 py-5 border-b border-rosely-dusk">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-rosely-cream">
            Vantage<span className="text-rosely-lilac">Map</span>
          </span>
        </div>
        <p className="text-xs text-rosely-mist mt-0.5">
          Business Strategy &amp; Architecture
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-rosely-lilac text-rosely-cream"
                  : "text-rosely-petal hover:bg-rosely-dusk hover:text-rosely-cream"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-rosely-dusk text-xs text-rosely-mist">
        VantageMap v1.0
      </div>
    </aside>
  );
}
