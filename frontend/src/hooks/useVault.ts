import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEth } from "../utils/format";
import { safeParseEther } from "../utils/parse";
import { useState } from "react";
import toast from "react-hot-toast";

// Hook for user-specific vault actions and data
export function useVault(
    depositETH: string,
    depositShares: string,
    withdrawETH: string,
    withdrawShares: string,
    resetDeposits: () => void,
    resetWithdraw: () => void,
    refetchStats: () => Promise<void>
) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    // Convert user inputs → wei (bigint)
    const depositETHWei = safeParseEther(depositETH);
    const depositSharesWei = safeParseEther(depositShares);
    const withdrawETHWei = safeParseEther(withdrawETH);
    const withdrawSharesWei = safeParseEther(withdrawShares);

    // Fetch user's shares and corresponding assets
    const { data: userSharesFetched,
        isLoading: isUserSharesLoading,
        isError: isUserSharesError,
        refetch: refetchShares
    } = useReadContract({
        ...vaultContractConfig,
        functionName: "balanceOf",
        args: [address!],
    });

    const { data: userAssetsFetched,
        isLoading: isUserAssetsLoading,
        isError: isUserAssetsError,
        refetch: refetchAssets
    } = useReadContract({
        ...vaultContractConfig,
        functionName: "convertToAssets",
        args: [userSharesFetched ?? 0n],
    });

    // Combined loading & error state
    const isUserLoading = isUserSharesLoading || isUserAssetsLoading;
    const isUserError = isUserSharesError || isUserAssetsError;

    // Preview values for deposit/withdraw
    const { data: previewDepositShares } = useReadContract({
        ...vaultContractConfig,
        functionName: "previewDeposit",
        args: [depositETHWei],
    });
    const { data: previewMintAssets } = useReadContract({
        ...vaultContractConfig,
        functionName: "previewMint",
        args: [depositSharesWei],
    });
    const { data: previewRedeemAssets } = useReadContract({
        ...vaultContractConfig,
        functionName: "previewRedeem",
        args: [withdrawSharesWei],
    });
    const { data: previewWithdrawShares } = useReadContract({
        ...vaultContractConfig,
        functionName: "previewWithdraw",
        args: [withdrawETHWei],
    });

    // Cast contract data
    const userShares = userSharesFetched as bigint | undefined;
    const userAssets = userAssetsFetched as bigint | undefined;

    // Format values for UI
    const formattedUserShares = formatEth(userShares);
    const formattedUserAssets = formatEth(userAssets);

    // Transaction loading states
    const [isDepositing, setIsDepositing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Function refetches stats
    async function refetchAll() {
        await Promise.all([
            refetchShares(),
            refetchAssets(),
        ]);
    }

    // Deposit (ETH or shares)
    async function deposit() {
        try {
            setIsDepositing(true);

            const txPromise = (async () => {
                if (depositETH) {
                    return await writeContractAsync({
                        ...vaultContractConfig,
                        functionName: "deposit",
                        value: depositETHWei
                    });
                }

                if (depositShares) {
                    return await writeContractAsync({
                        ...vaultContractConfig,
                        functionName: "mint",
                        args: [depositSharesWei],
                        value: previewMintAssets as bigint
                    });
                }
            })();

            await toast.promise(txPromise, {
                loading: "Depositing...",
                success: "Deposit successful 🎉",
                error: "Deposit failed ❌",
            });
            await refetchAll(); // 🔄 refresh UI
            resetDeposits();
            refetchStats();

        } catch (err) {
            console.error(err);
        } finally {
            setIsDepositing(false); // ✅ ALWAYS reset
        }
    }

    // Withdraw (by ETH or shares)
    async function withdraw() {
        try {
            setIsWithdrawing(true);

            const txPromise = (async () => {
                if (withdrawETH) {
                    return await writeContractAsync({
                        ...vaultContractConfig,
                        functionName: "withdraw",
                        args: [withdrawETHWei],
                    });
                }

                if (withdrawShares) {
                    return await writeContractAsync({
                        ...vaultContractConfig,
                        functionName: "redeem",
                        args: [withdrawSharesWei],
                    });
                }
            })();

            await toast.promise(txPromise, {
                loading: "Withdrawing...",
                success: "Withdraw successful 💰",
                error: "Withdraw failed ❌",
            });
            await refetchAll(); // 🔄 refresh UI
            resetWithdraw();
            refetchStats();

        } catch (err) {
            console.error(err);
        } finally {
            setIsWithdrawing(false); // ✅ ALWAYS reset
        }
    }

    return {
        formattedUserShares,
        formattedUserAssets,
        previewDepositShares,
        previewMintAssets,
        previewRedeemAssets,
        previewWithdrawShares,
        deposit,
        withdraw,
        isDepositing,
        isWithdrawing,
        isUserLoading,
        isUserError,
    };
}