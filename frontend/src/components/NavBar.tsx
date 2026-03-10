import { useAccount, useConnect, useDisconnect} from "wagmi";

function NavBar() {
    const { connect, connectors } = useConnect();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    return (
        <nav className="fixed top-10 left-1/2 -translate-x-1/2 z-50
                        flex items-center justify-between
                        w-[90%] px-6 h-15
                        bg-c5/10 backdrop-blur-md
                        rounded-3xl shadow-lg text-c6 font-medium text-lg">
            <a>PIGGYvault</a>
            {isConnected ? (
                <span>
                    {address?.slice(0,6)}....{address?.slice(-4)}
                </span>
            ) : (
                <span>
                    address...
                </span>
            )}

            {!isConnected ? (
                <button onClick={() => connect({connector: connectors[0]})}>Connect</button>
            ) : (
                <button onClick={() => disconnect()}>Disconnect</button>
            )}
        </nav>
    )
}

export default NavBar;