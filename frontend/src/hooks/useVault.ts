import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEth } from "../utils/format";
import { safeParseEther } from "../utils/parse";

export function useVault(
    depositETH: string,
    depositShares: string,
    withdrawETH: string,
    withdrawShares: string
) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    //converting deposits and withdrawls to bigint
    const depositETHWei = safeParseEther(depositETH);
    const depositSharesWei = safeParseEther(depositShares);
    const withdrawETHWei = safeParseEther(withdrawETH);
    const withdrawSharesWei = safeParseEther(withdrawShares);

    //getting total existing shares and assets of user
    const { data: userSharesFetched } = useReadContract({
        ...vaultContractConfig,
        functionName: "balanceOf",
        args: [address!],
    });

    const { data: userAssetsFetched } = useReadContract({
        ...vaultContractConfig,
        functionName: "convertToAssets",
        args: [userSharesFetched ?? 0n],
    });

    //previewing the required ETH or shares for deposit or withdrawl
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

    //defining as bigint
    
    const userShares = userSharesFetched as bigint | undefined;
    const userAssets = userAssetsFetched as bigint | undefined;

    // DERIVED VALUES
    const formattedUserShares = formatEth(userShares);
    const formattedUserAssets = formatEth(userAssets);

    async function deposit() {
        try {
            if (depositETH) {
                await writeContractAsync({
                    ...vaultContractConfig,
                    functionName: "deposit",
                    value: depositETHWei
                });
            }

            if (depositShares) {
                await writeContractAsync({
                    ...vaultContractConfig,
                    functionName: "mint",
                    args: [depositSharesWei],
                    value: previewMintAssets as bigint
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function withdraw() {
        try {
            // Withdraw using ETH input
            if (withdrawETH) {
                await writeContractAsync({
                    ...vaultContractConfig,
                    functionName: "withdraw",
                    args: [withdrawETHWei], // pass as argument, NOT value
                });
            }

            // Withdraw using shares input
            if (withdrawShares) {
                await writeContractAsync({
                    ...vaultContractConfig,
                    functionName: "redeem",
                    args: [withdrawSharesWei],
                });
            }

        } catch (err) {
            console.log("Withdraw error:", err);
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
    };
}