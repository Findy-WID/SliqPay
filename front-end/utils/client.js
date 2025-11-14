import { createPublicClient, createWalletClient, http, custom } from "viem";
import { moonbaseAlpha } from "viem/chains";
import registryAbi from "./registryAbi.json" assert { type: "json" };
import vaultAbi from "./vaultAbi.json" assert { type: "json" };
import fxOracleAbi from "./fxOracleAbi.json" assert { type: "json" };

// Contract addresses and RPC Config
const REGISTRY_ADDRESS = process.env.NEXT_SLIQ_ID_REGISTRY_ADDRESS;
const TREASURY_ADDRESS = process.env.NEXT_TREASURY_VAULT_ADDRESS;
const FXORACLE_ADDRESS = process.env.NEXT_FX_ORACLE_ADDRESS;

const MOONBASE_RPC_URL = process.env.NEXT_MOONBASE_RPC_URL;

// Viem client setup
const publicClient = createPublicClient({
  chain: {
    ...moonbaseAlpha,
    rpcUrls: { default: { http: [MOONBASE_RPC_URL] } },
  },
  transport: http(MOONBASE_RPC_URL),
});

// Wallet client for write functions
const walletClient = typeof window !== "undefined" ? createWalletClient({
  chain: moonbaseAlpha,
  transport: custom(window.ethereum),
}) : null;

// READ FUNCTIONS

// SliqIDRegistry Reads
export async function resolveAddress(sliqId) {
  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "resolveAddress",
      args: [sliqId],
    });
  } catch (err) {
    console.error("resolveAddress error:", err);
    return null;
  }
}

export async function getSliqIDByAddress(wallet) {
  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "getSliqByAddress",
      args: [wallet],
    });
  } catch (err) {
    console.error("getSliqIDByAddress error:", err);
    return null;
  }
}

export async function isSliqIDRegistered(sliqId) {
  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "isSliqIDRegistered",
      args: [sliqId],
    });
  } catch (err) {
    console.error("isSliqIDRegistered error:", err);
    return null;
  }
}

// TreasuryVault Reads
export async function getBalance(sliqId, token) {
  try {
    return await publicClient.readContract({
      address: TREASURY_ADDRESS,
      abi: vaultAbi,
      functionName: "getBalance",
      args: [sliqId, token],
    });
  } catch (err) {
    console.error("getBalance error:", err);
    return null;
  }
}

export async function getBalances(sliqId, tokens) {
  try {
    return await publicClient.readContract({
      address: TREASURY_ADDRESS,
      abi: vaultAbi,
      functionName: "getBalances",
      args: [sliqId, tokens],
    });
  } catch (err) {
    console.error("getBalances error:", err);
    return null;
  }
}

// FxOracle Reads
export async function getRate(token) {
  try {
    return await publicClient.readContract({
      address: FXORACLE_ADDRESS,
      abi: fxOracleAbi,
      functionName: "getRate",
      args: [token],
    });
  } catch (err) {
    console.error("getRate error:", err);
    return null;
  }
}

export async function convertAmount(fromToken, toToken, amount) {
  try {
    return await publicClient.readContract({
      address: FXORACLE_ADDRESS,
      abi: fxOracleAbi,
      functionName: "convertAmount",
      args: [fromToken, toToken, amount],
    });
  } catch (err) {
    console.error("convertAmount error:", err);
    return null;
  }
}

export async function isTokenSupported(token) {
  try {
    return await publicClient.readContract({
      address: FXORACLE_ADDRESS,
      abi: fxOracleAbi,
      functionName: "isTokenSupported",
      args: [token],
    });
  } catch (err) {
    console.error("isTokenSupported error:", err);
    return null;
  }
}

// WRITE FUNCTIONS (require wallet connection)

// Register new SliqID
export async function registerSliqId(sliqId, userAddress) {
  if (!walletClient) throw new Error("Wallet not connected");
  try {
    const txHash = await walletClient.writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "registerSliqId",
      args: [sliqId, userAddress],
    });
    console.log("registerSliqId tx:", txHash);
    return txHash;
  } catch (err) {
    console.error("registerSliqId error:", err);
    return null;
  }
}

// Route token payment (USDT, USDC, etc.)
export async function routePayment(recipientSliqId, token, amount) {
  if (!walletClient) throw new Error("Wallet not connected");
  try {
    const txHash = await walletClient.writeContract({
      address: TREASURY_ADDRESS,
      abi: vaultAbi,
      functionName: "routePayment",
      args: [recipientSliqId, token, amount],
    });
    console.log("routePayment tx:", txHash);
    return txHash;
  } catch (err) {
    console.error("routePayment error:", err);
    return null;
  }
}

// Route native token payment (DEV)
export async function routePaymentNative(recipientSliqId, value) {
  if (!walletClient) throw new Error("Wallet not connected");
  try {
    const txHash = await walletClient.writeContract({
      address: TREASURY_ADDRESS,
      abi: vaultAbi,
      functionName: "routePaymentNative",
      args: [recipientSliqId],
      value, // amount in wei
    });
    console.log("routePaymentNative tx:", txHash);
    return txHash;
  } catch (err) {
    console.error("routePaymentNative error:", err);
    return null;
  }
}

// Set token exchange rate (admin)
export async function setRate(token, newRate) {
  if (!walletClient) throw new Error("Wallet not connected");
  try {
    const txHash = await walletClient.writeContract({
      address: FXORACLE_ADDRESS,
      abi: fxOracleAbi,
      functionName: "setRate",
      args: [token, newRate],
    });
    console.log("setRate tx:", txHash);
    return txHash;
  } catch (err) {
    console.error("setRate error:", err);
    return null;
  }
}
