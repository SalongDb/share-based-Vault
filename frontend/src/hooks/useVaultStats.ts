import { useReadContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEther } from "viem";
import { formatEth } from "../utils/format";

// Hook to fetch and compute global vault stats
export function useVaultStats() {

    // Read total assets and total supply from contract
    const { data: totalAssets,
        isLoading: isAssetsLoading,
        isError: isAssetsError,
        refetch: refetchAssets
    } = useReadContract({
        ...vaultContractConfig,
        functionName: "totalAssets",
    });

    const { data: totalSupply,
        isLoading: isSupplyLoading,
        isError: isSupplyError,
        refetch: refetchSupply
    } = useReadContract({
        ...vaultContractConfig,
        functionName: "totalSupply"
    });

    // Combine loading and error states
    const isLoading = isAssetsLoading || isSupplyLoading;
    const isError = isAssetsError || isSupplyError;

    // Cast contract data to bigint
    const assets = totalAssets as bigint | undefined;
    const supply = totalSupply as bigint | undefined;

    // Format values for UI
    const formattedAssets = formatEth(assets);
    const formattedSupply = formatEth(supply);

    // Calculate share price = totalAssets / totalSupply
    const sharePrice =
        assets && supply && supply > 0n
            ? (
                Number(formatEther(assets)) /
                Number(formatEther(supply))
            ).toFixed(4)
            : "1.0000";

    // Function refetch stats
    const refetchStats = async () => {
        await Promise.all([
            refetchAssets(),
            refetchSupply(),
        ]);
    };

    return {
        sharePrice,
        formattedAssets,
        formattedSupply,
        isLoading,
        isError,
        refetchStats,
    }
}