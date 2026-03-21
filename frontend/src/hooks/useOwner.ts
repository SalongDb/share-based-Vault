import { useReadContract, useWriteContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEth } from "../utils/format";
import { safeParseEther } from "../utils/parse";
import toast from "react-hot-toast";

// Hook for owner-only actions (view fees + withdraw)
export function useOwner(withdrawAmount: string, refetchStats: () => Promise<void>) {

    // Write function for contract transactions
    const { writeContractAsync, isPending } = useWriteContract();

    // Convert input amount → wei
    const withdrawAmountWei = safeParseEther(withdrawAmount);

    // Read total fee balance from contract
    const { data: feeBalance,
        isLoading,
        isError,
        refetch: refetchFees
    } = useReadContract({
        ...vaultContractConfig,
        functionName: "feeBalance",
    });

    // Loading & error states for UI
    const isLoadingFees = isLoading;
    const isErrorFees = isError;

    // Format fee balance for display
    const formattedFee = feeBalance as bigint | undefined;
    const formattedFees = formatEth(formattedFee);

    // Withdraw collected fees (owner only)
    async function withdraw() {
        try {
            const txPromise = writeContractAsync({
                ...vaultContractConfig,
                functionName: "withdrawFees",
                args: [withdrawAmountWei],
            });

            await toast.promise(txPromise, {
                loading: "Withdrawing fees...",
                success: "Fees withdrawn 🎉",
                error: "Withdraw failed ❌",
            });

            await txPromise;

            refetchFees();
            refetchStats();

        } catch (err) {
            console.log(err);
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