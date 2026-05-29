import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns auth headers for client-side fetch calls.
 * In development, injects x-dev-user-id when NEXT_PUBLIC_DEV_USER_ID is set.
 */
export function clientAuthHeaders(): Record<string, string> {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_USER_ID
  ) {
    return { "x-dev-user-id": process.env.NEXT_PUBLIC_DEV_USER_ID };
  }
  return {};
}
