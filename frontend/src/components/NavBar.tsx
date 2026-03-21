import { useAccount, useConnect, useDisconnect } from "wagmi";

function NavBar() {
    // Wallet connection hooks
    const { connect, connectors, isPending } = useConnect();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    return (
        <nav className="fixed top-10 left-1/2 -translate-x-1/2 z-50
                        flex items-center justify-between
                        w-[90%] px-6 h-15
                        bg-c5/10 backdrop-blur-md
                        rounded-3xl shadow-lg text-c6 font-medium text-lg">

            {/* App name */}
            <a>PIGGYvault</a>

            {/* Show shortened wallet address when connected */}
            {isConnected && (
                <span>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
            )}

            {/* Connect / Disconnect button */}
            {!isConnected ? (
                <button
                    className="bg-transparent hover:bg-c4 px-3 py-1 rounded-3xl disabled:opacity-50"
                    
                    // Disable button while connecting
                    disabled={isPending || connectors.length === 0}
                    
                    onClick={() => {
                        // Ensure connector exists before connecting (prevents crash)
                        if (connectors.length > 0) {
                            connect({ connector: connectors[0] });
                        }
                    }}
                >
                    {/* Show loading state */}
                    {isPending ? "Connecting..." : "Connect"}
                </button>
            ) : (
                <button
                    className="bg-transparent hover:bg-c4 px-3 py-1 rounded-3xl"
                    
                    // Disconnect wallet session
                    onClick={() => disconnect()}
                >
                    Disconnect
                </button>
            )}
        </nav>
    );
}

export default NavBar;