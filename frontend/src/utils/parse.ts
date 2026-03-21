import { parseEther } from "viem";

// Safely converts user input (string) → wei (bigint)
export function safeParseEther(value: string): bigint {
  try {
    return value ? parseEther(value) : 0n; // parse valid input
  } catch {
    return 0n; // prevent crash on invalid input
  }
}