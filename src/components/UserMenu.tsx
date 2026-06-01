"use client";

/**
 * Phase 10 — User Menu Component
 *
 * Dropdown menu in the sidebar showing the current user's name/avatar
 * with links to profile, admin (if Admin role), and sign out.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, Shield, LogOut, ChevronUp } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user, isPending } = useAuthSession();
  const router = useRouter();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
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
              <ChevronUp className="size-4 text-rosely-mist transition-transform data-[state=open]:rotate-0 data-[state=closed]:rotate-180" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <div className="border-b border-rosely-blush px-2 py-2">
          <p className="text-sm font-medium text-rosely-night">{user.name}</p>
          <p className="text-xs text-rosely-mist">{user.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-3">
            <User className="size-4" />
            Profile &amp; Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/users" className="flex items-center gap-3">
            <Shield className="size-4" />
            Administration
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-3">
            <Settings className="size-4" />
            Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-rosely-rose">
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
