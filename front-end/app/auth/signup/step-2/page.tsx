"use client";

import Link from "next/link";
import { useState } from "react";
import SignupProgress from "@/components/SignupProgress";

export default function Step2() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/step-1" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={2} />
        <p className="text-xs text-gray-600 mt-1">Step 2</p>

        <h2 className="mt-6 text-xl font-extrabold">Verify Email</h2>
        <p className="text-sm text-gray-500">A 6-digit code has been sent to provided mail. Code expires in 30 minutes</p>

        <div className="mt-6 flex gap-3">
          {code.map((c, i) => (
            <input key={i} value={c} onChange={(e)=>{
                const v = e.target.value.replace(/\D/g, '').slice(0,1);
                setCode(prev=> prev.map((pv,idx)=> idx===i? v: pv));
              }}
              className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 text-center text-lg outline-none"/>
          ))}
        </div>

        <Link href="/auth/signup/step-3" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>

        <p className="mt-4 text-sm text-blue-600">Didn’t Receive any code?</p>
      </div>
    </div>
  );
}
