import { useReadContract, useWriteContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEth } from "../utils/format";
import { safeParseEther } from "../utils/parse";

export function useOwner(withdrawAmount: string) {

    const { writeContractAsync, isPending } = useWriteContract();

    const withdrawAmountWei = safeParseEther(withdrawAmount);

    const { data: feeBalance, isLoading,
  isError } = useReadContract({
        ...vaultContractConfig,
        functionName: "feeBalance",
    });

    const isLoadingFees = isLoading;
    const isErrorFees = isError;

    const formattedFee = feeBalance as bigint | undefined;
    const formattedFees = formatEth(formattedFee);

    async function withdraw() {
        try {
            await writeContractAsync({
                ...vaultContractConfig,
                functionName: "withdrawFees",
                args: [withdrawAmountWei],
            });

        } catch (err) {
            console.log("Withdraw error:", err);
        }
    }

    return {
        formattedFees,
        withdraw,
        isLoadingFees,
        isErrorFees,
        isPending,
    }

}