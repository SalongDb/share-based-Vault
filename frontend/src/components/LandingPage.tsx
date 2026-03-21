import NavBar from "./NavBar";
import { useVaultStats } from "../hooks/useVaultStats";

function LandingPage() {
  const { sharePrice, isLoading, isError } = useVaultStats();

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-c1 via-c3 to-c6 text-c6 font-oswald flex flex-col">

      <NavBar />

      {/* MAIN */}
      <div className="flex flex-1 px-20 items-center justify-between">

        {/* LEFT */}
        <div className="max-w-xl">

          <h1 className="text-[85px] font-semibold leading-tight">
            TRADE. <br /> MULTIPLY. <br /> MAX WITHDRAW.
          </h1>

          <p className="mt-6 text-c5 text-lg leading-relaxed">
            PiggyVault is a smart DeFi vault where your ETH grows automatically.
            Deposit, earn yield, and withdraw more than you started with — all on-chain.
          </p>

          {/* CONNECT HINT */}
          <div className="mt-10">
            <p className="text-c4 text-lg">
              Connect your wallet to start →
            </p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end text-right">

          <p className="text-c5 text-lg tracking-widest mb-2">
            CURRENT SHARE PRICE
          </p>

          <h1 className="text-[90px] font-bold text-c6 leading-none drop-shadow-[0_0_20px_rgba(204,208,207,0.25)]">
            {isLoading
              ? "..."
              : isError
                ? "Error"
                : sharePrice}
          </h1>

          <p className="text-c5 text-xl mb-8">ETH per Share</p>

          <h1 className="text-[80px] font-semibold text-c5 leading-tight">
            PIGGYvault
          </h1>

          <p className="text-c5/70 text-lg mt-4 max-w-sm">
            A smart yield vault designed to maximize your returns with seamless deposits and withdrawals.
          </p>

        </div>

      </div>

      {/* FEATURES */}
      <div className="flex justify-center pb-10">

        <div className="flex gap-16 text-center">

          <div className="flex flex-col items-center hover:scale-105 transition">
            <h2 className="text-3xl font-semibold text-c6 tracking-wide">
              Smart Yield
            </h2>
            <p className="text-c6/40 mt-2 text-lg">
              Auto-optimized returns
            </p>
          </div>

          <div className="flex flex-col items-center hover:scale-105 transition">
            <h2 className="text-3xl font-semibold text-c6 tracking-wide">
              Instant Liquidity
            </h2>
            <p className="text-c6/20 mt-2 text-lg">
              No lockups, withdraw anytime
            </p>
          </div>

          <div className="flex flex-col items-center hover:scale-105 transition">
            <h2 className="text-3xl font-semibold text-c6 tracking-wide">
              Fully On-Chain
            </h2>
            <p className="text-c2/20 mt-2 text-lg">
              Transparent & secure
            </p>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="text-center text-c5 text-sm pb-4">
        © 2026 PiggyVault
      </div>

    </div>
  );
}

export default LandingPage;