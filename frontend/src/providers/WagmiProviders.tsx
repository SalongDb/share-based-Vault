import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "../config/config";
import { WagmiProvider } from "wagmi";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

function Providers({ children }: {
    children : ReactNode
}) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default Providers;