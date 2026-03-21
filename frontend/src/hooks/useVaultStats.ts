import { useReadContract } from "wagmi";
import { vaultContractConfig } from "../contracts/vault";
import { formatEther } from "viem";
import { formatEth } from "../utils/format";

export function useVaultStats() {

    //getting totalAssets and totalSupply from contract
    const { data: totalAssets, isLoading: isAssetsLoading, isError: isAssetsError } = useReadContract({
        ...vaultContractConfig,
        functionName: "totalAssets",
    });

    const { data: totalSupply, isLoading: isSupplyLoading,
        isError: isSupplyError, } = useReadContract({
            ...vaultContractConfig,
            functionName: "totalSupply"
        });

    const isLoading = isAssetsLoading || isSupplyLoading;
    const isError = isAssetsError || isSupplyError;

    const assets = totalAssets as bigint | undefined;
    const supply = totalSupply as bigint | undefined;

    const formattedAssets = formatEth(assets);
    const formattedSupply = formatEth(supply);

    const sharePrice =
        assets && supply && supply > 0n
            ? (
                Number(formatEther(assets)) /
                Number(formatEther(supply))
            ).toFixed(4)
            : "1.0000";


    return {
        sharePrice,
        formattedAssets,
        formattedSupply,
        isLoading,
        isError,
    }
}