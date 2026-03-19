import { formatEther, parseEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import NavBar from "./NavBar";
import { vaultContractConfig } from "../contracts/vault";
import { useState } from "react";

function OwnerDashboard() {
    const [withdrawAmount,setWithdrawAmount] = useState("");

    const { data: totalAssets } = useReadContract({
        ...vaultContractConfig,
        functionName: "totalAssets",
    });

    const { data: totalSupply } = useReadContract({
        ...vaultContractConfig,
        functionName: "totalSupply",
    });

    const { data: feeBalance } = useReadContract({
        ...vaultContractConfig,
        functionName: "feeBalance",
    });

    const assets = totalAssets as bigint | undefined;
  const supply = totalSupply as bigint | undefined;

    const formattedAssets = totalAssets
        ? Number(formatEther(totalAssets as bigint)).toFixed(4)
        : "0";

    const formattedSupply = totalSupply
        ? Number(formatEther(totalSupply as bigint)).toFixed(4)
        : "0";

    const formattedFees = feeBalance
        ? Number(formatEther(feeBalance as bigint)).toFixed(4)
        : "0";



    const sharePrice = assets && supply && supply > 0n ? (Number(formatEther(assets)) / Number(formatEther(supply))).toFixed(4) : "1.0000";

    const { writeContractAsync } = useWriteContract();

    const withdrawAmountWei = withdrawAmount
  ? parseEther(withdrawAmount)
  : 0n;

    async function withdraw() {
        try {
            await writeContractAsync({
                ...vaultContractConfig,
                functionName: "withdrawFees",
                args: [withdrawAmountWei], // pass as argument, NOT value
            });

        } catch (err) {
            console.log("Withdraw error:", err);
        }
    }
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-c1 via-c3 to-c6 pt-24 px-10 text-c6 font-oswald">

            <NavBar />

            {/* Header */}
            <div className="flex justify-center my-8">
                <div className="bg-c2/40 backdrop-blur-lg px-10 py-6 rounded-2xl shadow-xl border border-c4/20">
                    <h1 className="text-3xl font-medium tracking-wide text-c5">
                        Share Price
                    </h1>
                    <p className="text-5xl font-semibold mt-2 text-c6">
                       {sharePrice} ETH
                    </p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-8 justify-center">

                {/* LEFT PANEL */}
                <div className="w-1/3 bg-c2/40 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-c4/20 flex flex-col justify-center gap-10">

                    <div>
                        <h2 className="flex justify-center text-3xl font-medium mb-4 text-green-400">WITHDRAW</h2>

                        <div className="space-y-4">
                            <input
                                className="w-full px-4 py-3 rounded-lg bg-c1/60 border border-c4/20 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-c4"
                                placeholder="Amount"
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            <button
                                className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold shadow-lg"
                                onClick={withdraw}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-1/3 bg-c2/40 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-c4/20 flex flex-col gap-6">

                    <h1 className="text-4xl font-medium mb-4 text-c5">Account</h1>

                    <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
                        <p className="text-c4">Total Fees</p>
                        <p className="text-2xl font-semibold mt-1 text-c6">{formattedFees}
                        </p>
                    </div>

                    <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
                        <p className="text-c4">Total Assets</p>
                        <p className="text-2xl font-semibold mt-1 text-c6">{formattedAssets}
                        </p>
                    </div>

                    <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
                        <p className="text-c4">Total Supply</p>
                        <p className="text-2xl font-semibold mt-1 text-c6">{formattedSupply}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default OwnerDashboard;