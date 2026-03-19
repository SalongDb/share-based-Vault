import { parseEther } from "viem";

export function safeParseEther(value: string): bigint {
  try {
    return value ? parseEther(value) : 0n;
  } catch {
    return 0n;
  }
}