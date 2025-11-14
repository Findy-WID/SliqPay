"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ReceiveMoney() {
  const router = useRouter();
  const { user, refreshAccount } = useUser();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock data - in real app, this would come from user's account
  const fiatDetails = {
    accountNo: "0123456789",
    accountName: "Maryam Adeniyi",
    bankName: "Sample Bank"
  };

  const cryptoDetails = {
    network: "ERC-20",
    usdcAddress: "0x12aB34cD56ef7890abCdef12345678990aBcDEF12",
    bankName: "Sample Bank"
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ fieldName, value }: { fieldName: string; value: string }) => (
    <button
      onClick={() => handleCopy(value, fieldName)}
      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
      aria-label={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? (
        <Check size={18} className="text-green-600" />
      ) : (
        <Copy size={18} className="text-green-600" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Receive Money</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-6">
          Share any of your details below to receive money directly into your SliqPay wallet.
        </p>

        {/* FIAT Section */}
        <div className="mb-6">
          <div className="bg-green-50 rounded-t-xl px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">FIAT</h2>
          </div>
          <div className="bg-gray-50 rounded-b-xl p-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Account No.</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">{fiatDetails.accountNo}</span>
                <CopyButton fieldName="fiat-account" value={fiatDetails.accountNo} />
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Account Name</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">{fiatDetails.accountName}</span>
                <CopyButton fieldName="fiat-name" value={fiatDetails.accountName} />
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Bank Name</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">{fiatDetails.bankName}</span>
                <CopyButton fieldName="fiat-bank" value={fiatDetails.bankName} />
              </div>
            </div>
          </div>
        </div>

        {/* SLIQPAY-TO-SLIQPAY Section */}
        <div className="mb-6">
          <div className="bg-green-50 rounded-t-xl px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">SLIQPAY-TO-SLIQPAY</h2>
          </div>
          <div className="bg-gray-50 rounded-b-xl p-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Sliq ID</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-cyan-700">
                  {user?.sliqId || "@username.sliq.eth"}
                </span>
                <CopyButton fieldName="sliqid" value={user?.sliqId || "@username.sliq.eth"} />
              </div>
            </div>
          </div>
        </div>

        {/* CRYPTO Section */}
        <div className="mb-8">
          <div className="bg-green-50 rounded-t-xl px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">CRYPTO</h2>
          </div>
          <div className="bg-gray-50 rounded-b-xl p-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">User Network</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">{cryptoDetails.network}</span>
                <CopyButton fieldName="crypto-network" value={cryptoDetails.network} />
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-start justify-between py-2">
              <span className="text-sm text-gray-600">USDC Address</span>
              <div className="flex items-start max-w-[60%]">
                <span className="text-sm font-semibold text-gray-900 break-all text-right">
                  {cryptoDetails.usdcAddress}
                </span>
                <CopyButton fieldName="crypto-address" value={cryptoDetails.usdcAddress} />
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Bank Name</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">{cryptoDetails.bankName}</span>
                <CopyButton fieldName="crypto-bank" value={cryptoDetails.bankName} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // TODO: Implement share functionality
              alert("Share functionality to be implemented");
            }}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Share Address
          </button>
          <button
            onClick={async () => {
              await refreshAccount();
              router.push("/dashboard");
            }}
            className="w-full bg-white text-green-600 font-semibold py-3 rounded-xl border-2 border-green-600 hover:bg-green-50 transition-colors"
          >
            Back home
          </button>
        </div>
      </div>
    </div>
  );
}
