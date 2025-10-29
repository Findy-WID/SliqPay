"use client";

import Link from "next/link";

export default function WalletSuccess() {
  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">✓</div>
        <h1 className="text-xl font-extrabold">Wallet Connection Successful</h1>
        <p className="mt-2 text-sm text-gray-600 bg-blue-50 inline-block px-3 py-1 rounded">Your wallet has been securely linked to SliqPay.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">Wallet Address:</div>
          <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">0x4A8C...E52B</div>
        </div>

        <Link href="/dashboard" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>
      </div>
    </div>
  );
}
