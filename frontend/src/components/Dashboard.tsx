import { useAccount, useReadContract, useWriteContract } from "wagmi";
import NavBar from "./NavBar";
import { vaultContractConfig } from "../contracts/vault";
import { formatEther, parseEther } from "viem";
import { useState } from "react";

function Dashboard() {
  const { address } = useAccount();

  //state vcariables for deposit
  const [depositETH, setDepositETH] = useState("");
  const [depositShares, setDepositShares] = useState("");

  //state variables for withdraw
  const [withdrawETH, setWithdrawETH] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");

  //getting totalAssets and totalSupply from contract
  const { data: totalAssets } = useReadContract({
    ...vaultContractConfig,
    functionName: "totalAssets",
  });

  const { data: totalSupply } = useReadContract({
    ...vaultContractConfig,
    functionName: "totalSupply"
  });

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

  //converting deposits and withdrawls to bigint
  const depositETHWei = depositETH ? parseEther(depositETH) : 0n;
  const depositSharesWei = depositShares ? parseEther(depositShares) : 0n;
  const withdrawETHWei = withdrawETH ? parseEther(withdrawETH) : 0n;
  const withdrawSharesWei = withdrawShares ? parseEther(withdrawShares) : 0n;

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
  const assets = totalAssets as bigint | undefined;
  const supply = totalSupply as bigint | undefined;
  const userShares = userSharesFetched as bigint | undefined;
  const userAssets = userAssetsFetched as bigint | undefined;

  //formatting to Ether
  const sharePrice = assets && supply && supply > 0n ? (Number(formatEther(assets)) / Number(formatEther(supply))).toFixed(4) : "1.0000";
  const formattedUserShares = userShares ? Number(formatEther(userShares)).toFixed(4) : 0;
  const formattedUserAssets = userAssets ? Number(formatEther(userAssets)).toFixed(4) : 0;

  const { writeContractAsync } = useWriteContract();

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-c1 via-c3 to-c6 pt-24 px-10 text-c6 font-oswald">

      <NavBar />

      {/* Header */}
      <div className="flex justify-center my-8">
        <div className="bg-c2/40 backdrop-blur-lg px-10 py-6 rounded-2xl shadow-xl border border-c4/20">
          <h1 className="text-4xl font-medium tracking-wide text-c5">
            Share Price
          </h1>
          <p className="text-5xl font-semibold mt-2 text-c6">
            {sharePrice} ETH
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-8">

        {/* LEFT PANEL */}
        <div className="w-1/2 bg-c2/40 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-c4/20 flex flex-col gap-10">

          {/* BUY */}
          <div>
            <h2 className="text-3xl font-medium mb-4 text-green-400">Buy</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/60 border border-c4/20 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-c4"
                  value={depositETH}
                  onChange={(e) => {
                    setDepositETH(e.target.value);
                    setDepositShares("");
                  }}
                  placeholder="ETH"
                />
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/40 border border-c4/10 text-c5"
                  value={previewDepositShares ? formatEther(previewDepositShares as bigint) : ""}
                  readOnly
                  placeholder="Shares"
                />
              </div>

              <div className="flex gap-3">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/60 border border-c4/20 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-c4"
                  value={depositShares}
                  onChange={(e) => {
                    setDepositShares(e.target.value);
                    setDepositETH("");
                  }}
                  placeholder="Shares"
                />
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/40 border border-c4/10 text-c5"
                  value={previewMintAssets ? formatEther(previewMintAssets as bigint) : ""}
                  readOnly
                  placeholder="ETH"
                />
              </div>

              <button
                className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold shadow-lg"
                onClick={deposit}
              >
                Deposit
              </button>
            </div>
          </div>

          {/* SELL */}
          <div>
            <h2 className="text-3xl font-medium mb-4 text-red-400">Sell</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/60 border border-c4/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-c4"
                  value={withdrawETH}
                  onChange={(e) => {
                    setWithdrawETH(e.target.value);
                    setWithdrawShares("");
                  }}
                  placeholder="ETH"
                />
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/40 border border-c4/10 text-c5"
                  value={previewWithdrawShares ? formatEther(previewWithdrawShares as bigint) : ""}
                  readOnly
                  placeholder="Shares"
                />
              </div>

              <div className="flex gap-3">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/60 border border-c4/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-c4"
                  value={withdrawShares}
                  onChange={(e) => {
                    setWithdrawShares(e.target.value);
                    setWithdrawETH("");
                  }}
                  placeholder="Shares"
                />
                <input
                  className="w-full px-4 py-3 rounded-lg bg-c1/40 border border-c4/10 text-c5"
                  value={previewRedeemAssets ? formatEther(previewRedeemAssets as bigint) : ""}
                  readOnly
                  placeholder="ETH"
                />
              </div>

              <button
                className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 transition font-semibold shadow-lg"
                onClick={withdraw}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 bg-c2/40 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-c4/20 flex flex-col gap-6">

          <h1 className="text-4xl font-medium mb-4 text-c5">Account</h1>

          <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
            <p className="text-c4">Total Assets</p>
            <p className="text-2xl font-semibold mt-1 text-c6">
              {formattedUserAssets} ETH
            </p>
          </div>

          <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
            <p className="text-c4">Total Shares</p>
            <p className="text-2xl font-semibold mt-1 text-c6">
              {formattedUserShares} xETH
            </p>
          </div>

          <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
            <p className="text-c4">Your Deposit</p>
            <p className="text-2xl font-semibold mt-1 text-c6">
              {formattedUserAssets} ETH
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;