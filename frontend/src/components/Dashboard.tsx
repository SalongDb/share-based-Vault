import NavBar from "./NavBar";
import { formatEther } from "viem";
import { useState } from "react";
import { useVault } from "../hooks/useVault";
import { useVaultStats } from "../hooks/useVaultStats";

function Dashboard() {

  //state vcariables for deposit
  const [depositETH, setDepositETH] = useState("");
  const [depositShares, setDepositShares] = useState("");

  //state variables for withdraw
  const [withdrawETH, setWithdrawETH] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");

  const { sharePrice, isLoading, isError } = useVaultStats();

  const {
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
  } = useVault(
    depositETH,
    depositShares,
    withdrawETH,
    withdrawShares,
  );

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
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p className="text-red-400">Error loading data</p>
            ) : (
              <p>{sharePrice} ETH</p>
            )}
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
                  disabled={isDepositing}
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
                  disabled={isDepositing}
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
                disabled={isDepositing || (!depositETH && !depositShares)}
                className={`w-full py-3 rounded-lg font-semibold shadow-lg ${isDepositing ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} `}
                onClick={deposit}
              >
                {isDepositing ? "Processing..." : "Deposit"}
              </button>
            </div>
          </div>

          {/* SELL */}
          <div>
            <h2 className="text-3xl font-medium mb-4 text-red-400">Sell</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  disabled={isWithdrawing}
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
                  disabled={isWithdrawing}
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
                disabled={isWithdrawing || (!withdrawETH && !withdrawShares)}
                className={`w-full py-3 rounded-lg font-semibold shadow-lg ${isWithdrawing ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}
                onClick={withdraw}
              >
                {isWithdrawing ? "Processing..." : "Withdraw"}
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
              {isUserLoading
                ? "Loading..."
                : isUserError
                  ? "Error"
                  : `${formattedUserAssets} ETH`}
            </p>
          </div>

          <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
            <p className="text-c4">Total Shares</p>
            <p className="text-2xl font-semibold mt-1 text-c6">
              {isUserLoading
                ? "Loading..."
                : isUserError
                  ? "Error"
                  : `${formattedUserShares} ETH`}
            </p>
          </div>

          <div className="bg-c1/40 p-5 rounded-xl border border-c4/20">
            <p className="text-c4">Your Deposit</p>
            <p className="text-2xl font-semibold mt-1 text-c6">
              {isUserLoading
                ? "Loading..."
                : isUserError
                  ? "Error"
                  : `${formattedUserAssets} ETH`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;