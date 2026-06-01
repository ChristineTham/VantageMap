"use client";

/**
 * Phase 10 — User Menu Component
 *
 * Dropdown menu in the sidebar showing the current user's name/avatar
 * with links to profile, admin (if Admin role), and sign out.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, Shield, LogOut, ChevronUp } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user, isPending } = useAuthSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isPending || !user) {
    return (
      <div className="px-3 py-2">
        <div className="h-8 w-full animate-pulse rounded-lg bg-rosely-petal" />
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-rosely-petal/50",
          collapsed ? "justify-center" : ""
        )}
        aria-label="User menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rosely-lilac/30 text-xs font-medium text-rosely-plum">
          {initials}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left text-rosely-night">{user.name}</span>
            <ChevronUp
              className={cn(
                "size-4 text-rosely-mist transition-transform",
                open ? "rotate-0" : "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 rounded-lg border border-rosely-blush bg-white py-1 shadow-lg">
          <div className="border-b border-rosely-blush px-4 py-2">
            <p className="text-sm font-medium text-rosely-night">{user.name}</p>
            <p className="text-xs text-rosely-mist">{user.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-rosely-dusk hover:bg-rosely-petal/50 hover:text-rosely-night"
          >
            <User className="size-4" />
            Profile & Settings
          </Link>

          <Link
            href="/admin/users"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-rosely-dusk hover:bg-rosely-petal/50 hover:text-rosely-night"
          >
            <Shield className="size-4" />
            Administration
          </Link>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-rosely-dusk hover:bg-rosely-petal/50 hover:text-rosely-night"
          >
            <Settings className="size-4" />
            Preferences
          </Link>

          <div className="border-t border-rosely-blush">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rosely-rose hover:bg-rosely-petal/50"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
