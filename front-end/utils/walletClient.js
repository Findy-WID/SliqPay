import { createWalletClient, custom } from "viem";
import { moonbaseAlpha } from "viem/chains";

export function getWalletClient(provider) {
    if(!provider) throw new Error("No wallet provider found.");

        return createWalletClient({
        chain: moonbaseAlpha,
        transport: custom(provider)
    });
}

