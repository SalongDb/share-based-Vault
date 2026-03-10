import { useAccount, useReadContract } from "wagmi";
import NavBar from "./NavBar";
import { vaultContractConfig } from "../contracts/vault";
import { formatEther, parseEther } from "viem";
import { useState } from "react";

function Dashboard() {
  const { address } = useAccount();

  const [depositETH, setDepositETH] = useState("");
  const [depositShares, setDepositShares] = useState("");

  const [withdrawETH, setWithdrawETH] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");

  const { data: totalAssets } = useReadContract({
    ...vaultContractConfig,
    functionName: "totalAssets"
  });

  const { data: totalSupply } = useReadContract({
    ...vaultContractConfig,
    functionName: "totalSupply"
  });

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

  const depositETHWei = depositETH ? parseEther(depositETH) : 0n;
  const depositSharesWei = depositShares ? parseEther(depositShares) : 0n;

  const withdrawETHWei = withdrawETH ? parseEther(withdrawETH) : 0n;
  const withdrawSharesWei = withdrawShares ? parseEther(withdrawShares) : 0n;

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

  const assets = totalAssets as bigint | undefined;
  const supply = totalSupply as bigint | undefined;
  const userShares = userSharesFetched as bigint | undefined;
  const userAssets = userAssetsFetched as bigint | undefined;

  const sharePrice = assets && supply && supply > 0n ? Number(formatEther(assets)) / Number(formatEther(supply)) : 1;
  const formattedUserShares = userShares ? formatEther(userShares) : 0;
  const formattedUserAssets = userAssets ? formatEther(userAssets) : 0;

  return (
    <div className="w-full min-h-screen 
                    bg-gradient-to-br from-c1  
                    via-c3 to-c6 pt-30 px-24">

      <NavBar></NavBar>
      <div className="flex justify-between 
                      items-center gap-2 h-[80vh] 
                      bg-c5/10 backdrop-blur-md
                      rounded-3xl shadow-lg text-c6 
                      p-2 font-oswald font-light">

        <div className="flex flex-col items-start 
                        h-[78vh] bg-c2/10 rounded-3xl 
                        w-[45vw] gap-5 px-6">

          <span className="text-[70px]">Share Price : {sharePrice} ETH </span>
          <div className="text-[20px]">
            <span className="text-[40px]">Deposit</span>
            <div>
              <span>Amount : </span>
              <input
                value={depositETH}
                onChange={(e) => {
                  setDepositETH(e.target.value);
                  setDepositShares("");
                }}
                placeholder="ETH"
              />
              <input
                value={previewDepositShares ? formatEther(previewDepositShares as bigint) : ""}
                readOnly
                placeholder="Shares"
              />
            </div>
            <div>
              <span>Shares : </span>
              <input
                value={depositShares}
                onChange={(e) => {
                  setDepositShares(e.target.value);
                  setDepositETH("");
                }}
                placeholder="Shares"
              />
              <input
                value={previewMintAssets ? formatEther(previewMintAssets as bigint) : ""}
                readOnly
                placeholder="ETH"
              />
            </div>
          </div>
          <span>OR</span>
          <div className="text-[20px]">
            <span className="text-[40px]">Withdraw</span>
            <div>
              <span>Amount : </span>
              <input
                value={withdrawETH}
                onChange={(e) => {
                  setWithdrawETH(e.target.value);
                  setWithdrawShares("");
                }}
                placeholder="ETH"
              />
              <input
                value={previewWithdrawShares ? formatEther(previewWithdrawShares as bigint) : ""}
                readOnly
                placeholder="Shares"
              />
            </div>
            <div>
              <span>Shares : </span>
              <input
                value={withdrawShares}
                onChange={(e) => {
                  setWithdrawShares(e.target.value);
                  setWithdrawETH("");
                }}
                placeholder="Shares"
              />
              <input
                value={previewRedeemAssets ? formatEther(previewRedeemAssets as bigint) : ""}
                readOnly
                placeholder="ETH"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-[78vh] bg-c2/10 rounded-3xl w-[45vw] text-[20px] gap-5 px-6">
          <h1 className="text-[70px]">Account Info</h1>
          <div>
            Total Assets : {formattedUserAssets} ETH
          </div>
          <div>
            Total Shares : {formattedUserShares} xETH
          </div>
          <div>
            Total Deposit : {formattedUserAssets} ETH
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;