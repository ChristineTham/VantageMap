"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateButtonProps {
  href: string;
  label: string;
  className?: string;
}

/**
 * "Create New" button linking to the create form for a fact sheet type.
 */
export function CreateButton({ href, label, className }: CreateButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-rosely-plum px-3 py-2 text-sm font-medium text-white",
        "hover:bg-rosely-plum/90 transition-colors",
        className
      )}
    >
      <Plus className="size-4" />
      {label}
    </Link>
  );
}
