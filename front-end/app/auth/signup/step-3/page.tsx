"use client";

import Link from "next/link";
import { useState } from "react";
import SignupProgress from "@/components/SignupProgress";

export default function Step3() {
  const [residence, setResidence] = useState("Nigeria");
  const [nationality, setNationality] = useState("Nigeria");
  const [method, setMethod] = useState<'BVN'|'NIN'>('NIN');
  const [value, setValue] = useState("");

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/step-2" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={3} />
        <p className="text-xs text-gray-600 mt-1">Step 3</p>

        <h2 className="mt-6 text-xl font-extrabold">Get Verified</h2>
        <p className="text-sm text-gray-500">Please note that the verification document you can upload here depends on your chosen Nationality</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Residence</label>
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-3 py-3">
              <span>🇳🇬</span>
              <select value={residence} onChange={(e)=>setResidence(e.target.value)} className="flex-1 bg-transparent outline-none">
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nationality</label>
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-3 py-3">
              <span>🇳🇬</span>
              <select value={nationality} onChange={(e)=>setNationality(e.target.value)} className="flex-1 bg-transparent outline-none">
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2">Verify with BVN or NIN</p>
            <div className="flex items-center gap-6 mb-3 text-sm">
              <label className="inline-flex items-center gap-2"><input type="radio" checked={method==='BVN'} onChange={()=>setMethod('BVN')} /> BVN</label>
              <label className="inline-flex items-center gap-2"><input type="radio" checked={method==='NIN'} onChange={()=>setMethod('NIN')} /> NIN</label>
            </div>
            <input value={value} onChange={(e)=>setValue(e.target.value)} placeholder="012345678901" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 outline-none" />
          </div>
        </div>

        <Link href="/auth/signup/verifying" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>
      </div>
    </div>
  );
}
