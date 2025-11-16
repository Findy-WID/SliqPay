"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { publicClient } from "@/utils/client";
import { CURRENCY_TOKENS } from "@/lib/currencies";
import fxOracleAbi from "@/utils/fxOracleAbi.json";
import vaultAbiJson from "@/utils/vaultAbi.json";
import type { Abi } from 'viem';
import { useWalletClient } from "wagmi";

const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_ADDRESS || "";
const FX_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_FX_ORACLE_ADDRESS || "";

export const vaultAbi = vaultAbiJson.abi as Abi;
// Minimal ERC20 ABI
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

export default function RecipientInner() {
  const router = useRouter();
  const { data: wallet } = useWalletClient(); // <-- FIXED

  // form fields
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // params
  const [sendAmountParam, setSendAmountParam] = useState("0");
  const [sendCurrencyParam, setSendCurrencyParam] = useState("NGN");
  const [receiveAmountParam, setReceiveAmountParam] = useState("0.00");
  const [receiveCurrencyParam, setReceiveCurrencyParam] = useState("GHS");

  const [rate, setRate] = useState<number | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const SENDER_SLIQ_ID = "@findy.sliq";
  const RECIPIENT_SLIQ_ID = "@allan.sliq";

  // Load query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;

    setSendAmountParam(sp.get("sendAmount") || "0");
    setSendCurrencyParam(sp.get("sendCurrency") || "NGN");
    setReceiveAmountParam(sp.get("receiveAmount") || "0.00");
    setReceiveCurrencyParam(sp.get("receiveCurrency") || "GHS");
  }, []);

  // Fetch FX Rate
  useEffect(() => {
    async function fetchRate() {
      try {
        const tokenAddress = CURRENCY_TOKENS[sendCurrencyParam as keyof typeof CURRENCY_TOKENS];
        if (!tokenAddress || !FX_ORACLE_ADDRESS) {
          setRate(null);
          return;
        }

        const res = await publicClient.readContract({
          address: FX_ORACLE_ADDRESS as `0x${string}`,
          abi: fxOracleAbi as any,
          functionName: "getRate",
          args: [tokenAddress],
        });

        const n = typeof res === "bigint" ? Number(res) : Number(res || 0);
        setRate(Number.isFinite(n) ? n : null);
      } catch {
        setRate(null);
      }
    }
    fetchRate();
  }, [sendCurrencyParam]);

  const formatAmount = (val: string) => {
    const num = Number(val.replace(/,/g, ""));
    if (Number.isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isAccountNumberValid = accountNumber.trim() !== "" && /^\d+$/.test(accountNumber);
  const isAccountNameValid = accountName.trim() !== "" && /^[A-Za-z ]+$/.test(accountName);
  const isBankNameValid = bankName.trim() !== "" && /^[A-Za-z ]+$/.test(bankName);
  const isFormValid = isAccountNumberValid && isAccountNameValid && isBankNameValid;

  // ---------------------------
  // HANDLE TRANSFER
  // ---------------------------
  const handleConfirmTransfer = async () => {
    setTxError(null);
    setLoadingTx(true);

    try {
      if (!wallet) throw new Error("Wallet not connected");

      const tokenAddress = CURRENCY_TOKENS[sendCurrencyParam as keyof typeof CURRENCY_TOKENS];
      if (!TREASURY_ADDRESS) throw new Error("Treasury not configured");
      if (!tokenAddress) throw new Error("Unknown currency: " + sendCurrencyParam);

      const rawAmount = BigInt(Math.floor(Number(sendAmountParam)));
      if (rawAmount <= BigInt(0)) throw new Error("Invalid amount");

      const ZERO = "0x0000000000000000000000000000000000000000";

      // NATIVE TOKEN TRANSFER
      if (tokenAddress === ZERO) {
        const { request } = await publicClient.simulateContract({
          address: TREASURY_ADDRESS as `0x${string}`,
          abi: vaultAbi as Abi,
          functionName: "routePaymentNative",
          args: [RECIPIENT_SLIQ_ID],
          value: rawAmount,
        });

        await wallet.writeContract(request);
      }

      // ERC20 TRANSFER
      else {
        // 1. Approve
        const { request: approveReq } = await publicClient.simulateContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [TREASURY_ADDRESS, rawAmount],
        });

        await wallet.writeContract(approveReq);

        // 2. routePayment
        const { request: routeReq } = await publicClient.simulateContract({
          address: TREASURY_ADDRESS as `0x${string}`,
          abi: vaultAbi,
          functionName: "routePayment",
          args: [RECIPIENT_SLIQ_ID, tokenAddress, rawAmount],
        });

        await wallet.writeContract(routeReq);
      }

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      setTxError(err?.message || "Transaction failed");
    } finally {
      setLoadingTx(false);
    }
  };

  // ---------------------------
  // UI STARTS HERE
  // ---------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* --- HEADER --- */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => router.back()} className="p-2 ml-12 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Recipient</h1>
        </div>
      </header>

      {/* rest of UI unchanged… */}
    </div>
  );
}
