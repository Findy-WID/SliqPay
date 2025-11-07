"use client";

import Link from "next/link";

export default function ConnectWallet() {
  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/get-started" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-xl font-extrabold mb-1">Connect Wallet</h1>
        <p className="text-sm text-gray-500">Enter wallet ID to get started</p>

        <div className="mt-6 space-y-3">
          <button className="w-full rounded-2xl border-2 border-sky-300 bg-white p-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="text-2xl">🦊</span> MetaMask</span>
            <span className="text-blue-600">Connect</span>
          </button>
          <button className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-left">⬤ Coinbase Wallet</button>
          <button className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-left">◇ Binance Wallet</button>
        </div>

        <p className="mt-4 text-sm text-gray-600">By connecting your wallet, you agree to <span className="text-blue-600">Sliqpay Terms of Service</span></p>

        <Link href="/auth/signup/create-login-details" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>

        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
