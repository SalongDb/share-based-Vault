import { createConfig, http, injected } from 'wagmi';
import { localhost} from 'wagmi/chains';

export const config = createConfig({
    chains: [localhost],
    connectors: [
        injected(),
    ],
    transports: {
        [localhost.id]: http("http://127.0.0.1:8545"),
    },
})