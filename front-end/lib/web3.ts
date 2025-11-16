import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("WalletConnect Project ID is not set. Get one at https://cloud.walletconnect.com");
}

const metadata = {
  name: "SliqPay",
  description: "Send, receive, and convert crypto with ease",
  url: "https://sliqpay.com",
  icons: ["https://sliqpay.com/icon.png"],
};

// Define the chains
const chains = [mainnet, polygon, arbitrum, base, optimism] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
