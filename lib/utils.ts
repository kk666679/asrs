import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names using clsx only.
 * (No tailwind-merge – conflicts are resolved by later classes in the order they appear.)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}