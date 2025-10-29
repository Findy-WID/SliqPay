"use client";

import Link from "next/link";
import { useState } from "react";
import SignupProgress from "@/components/SignupProgress";

export default function Step1() {
  const [email, setEmail] = useState("");
  const [sliqId, setSliqId] = useState("");

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/get-started" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={1} />
        <p className="text-xs text-gray-600 mt-1">Step 1</p>

        <h2 className="mt-6 text-xl font-extrabold">Create an account</h2>
        <p className="text-sm text-gray-500">Enter your Email to get started</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Oluwabunmi@sampleemail.com" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Create Sliq ID</label>
            <div className="relative">
              <input value={sliqId} onChange={(e)=>setSliqId(e.target.value)} type="text" placeholder="@ Olubumix" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-10 py-3 outline-none" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✔</span>
            </div>
          </div>
        </div>

        <Link href="/auth/signup/step-2" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>

        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link className="text-blue-600" href="/auth/login">Login</Link></p>
      </div>
    </div>
  );
}
