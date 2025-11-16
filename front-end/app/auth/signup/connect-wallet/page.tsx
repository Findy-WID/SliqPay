"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function ConnectWallet() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setShowSuccess(true);
      // Auto-save wallet address to user profile or session storage
      sessionStorage.setItem("walletAddress", address);
    }
  }, [isConnected, address]);

  const handleConnectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowSuccess(false);
    sessionStorage.removeItem("walletAddress");
  };

  const handleContinue = () => {
    if (isConnected && address) {
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/auth/signup/step-5" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
          <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
        </div>
        {!isConnected && (
          <button onClick={handleSkip} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Skip
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-xl font-extrabold mb-1">Connect Wallet (Optional)</h1>
        <p className="text-sm text-gray-500">
          {isConnected ? "Wallet connected successfully! You can now use crypto features." : "Connect your crypto wallet to enable crypto transactions"}
        </p>

        {!isConnected ? (
          <>
            <div className="mt-6 space-y-3">
              <button 
                onClick={handleConnectWallet}
                className="w-full rounded-2xl border-2 border-sky-300 bg-white p-4 flex items-center justify-between hover:bg-sky-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🔗</span> 
                  <span className="font-semibold">Connect with WalletConnect</span>
                </span>
                <span className="text-blue-600 font-medium">Connect</span>
              </button>
              
              <button 
                onClick={handleConnectWallet}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">🦊</span> 
                <span className="font-medium">MetaMask</span>
              </button>
              
              <button 
                onClick={handleConnectWallet}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">⬤</span> 
                <span className="font-medium">Coinbase Wallet</span>
              </button>
              
              <button 
                onClick={handleConnectWallet}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">◇</span> 
                <span className="font-medium">Other Wallets</span>
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              By connecting your wallet, you agree to <span className="text-blue-600 cursor-pointer hover:underline">Sliqpay Terms of Service</span>
            </p>
          </>
        ) : (
          <div className="mt-6">
            {/* Success State */}
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Check size={32} className="text-white" strokeWidth={3} />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Wallet Connected!</h3>
                <p className="text-sm text-gray-600 mb-4">Your wallet address:</p>
                <div className="bg-white rounded-xl p-3 border border-gray-200 mb-4">
                  <code className="text-sm font-mono text-gray-800">{address && formatAddress(address)}</code>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={isConnected ? handleContinue : handleSkip}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 transition-colors"
        >
          {isConnected ? "Continue to Dashboard" : "Skip & Continue to Dashboard"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
