"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GetStarted() {
  const [selection, setSelection] = useState<"email" | "wallet" | null>(null);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      {/* decorative background */}
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      {/* header */}
      <div className="flex items-center gap-3">
        <Link href="/auth/signup" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Get started with Sliqpay</h1>
        <p className="text-sm text-gray-500 mb-6">Choose how you’d like to start</p>

        <div className="space-y-4" role="radiogroup" aria-label="Signup method">
          <button
            type="button"
            role="radio"
            aria-checked={selection === "email"}
            onClick={() => setSelection("email")}
            className={`w-full text-left rounded-2xl border-2 bg-white p-4 focus:outline-none transition-colors ${
              selection === "email"
                ? "border-green-500 ring-2 ring-green-200"
                : "border-gray-200 hover:border-green-500 focus:ring-2 focus:ring-sky-300"
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1"></div>
              <div>
                <p className="font-semibold">Sign Up with Email</p>
                <p className="text-sm text-gray-600">Ideal if you want to send, receive, and manage fiat payments or link bank accounts</p>
              </div>
            </div>
          </button>

          {/* <button
            type="button"
            role="radio"
            aria-checked={selection === "wallet"}
            onClick={() => setSelection("wallet")}
            className={`w-full text-left rounded-2xl border-2 bg-white p-4 transition-colors ${
              selection === "wallet"
                ? "border-green-500 ring-2 ring-green-200"
                : "border-gray-200 hover:border-green-500 focus:ring-2 focus:ring-sky-300"
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1"></div>
              <div>
                <p className="font-semibold">Connect Wallet</p>
                <p className="text-sm text-gray-600">Use your existing crypto wallet to access blockchain-based services and digital assets</p>
              </div>
            </div>
          </button> */}
        </div>

        <div className="mt-8">
          <button
            type="button"
            disabled={!selection}
            onClick={() => {
              if (selection === "email") router.push("/auth/signup/step-1");
              if (selection === "wallet") router.push("/auth/signup/connect-wallet");
            }}
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium text-white transition-colors ${
              selection ? "bg-green-600 hover:bg-green-700" : "bg-green-600/50 cursor-not-allowed"
            }`}
            aria-disabled={!selection}
          >
            Continue
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
