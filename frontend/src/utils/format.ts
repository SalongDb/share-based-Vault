import { formatEther } from "viem";

// Formats wei (bigint) → ETH string with 4 decimal places
export const formatEth = (value?: bigint) =>
  value ? Number(formatEther(value)).toFixed(4) : "0";