import { formatEther } from "viem";

export const formatEth = (value?: bigint) => value ? Number(formatEther(value)).toFixed(4) : "0";