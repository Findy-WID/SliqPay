"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateLoginDetails() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCPw] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const criteria = [
    { label: '8 to 12 characters', ok: pw.length >= 8 && pw.length <= 12 },
    { label: 'At least 1 number', ok: /\d/.test(pw) },
    { label: 'At least 1 upper case letter', ok: /[A-Z]/.test(pw) },
  ];

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/connect-wallet" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-xl font-extrabold mb-1">Create Login Details</h1>
        <p className="text-sm text-gray-500">Create a Login details so you can sign in without connecting your wallet every time.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Olubunmi@sampleemail.com" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 outline-none" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input value={pw} onChange={(e)=>setPw(e.target.value)} type={show1? 'text': 'password'} placeholder="****************" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 pr-10 outline-none" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={()=>setShow1(v=>!v)}>👁️</button>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {criteria.map((c)=> (
                <li key={c.label} className="flex items-center gap-2">
                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${c.ok? 'bg-green-100 border-green-300 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>✓</span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input value={cpw} onChange={(e)=>setCPw(e.target.value)} type={show2? 'text': 'password'} placeholder="****************" className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 pr-10 outline-none" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={()=>setShow2(v=>!v)}>👁️</button>
            </div>
          </div>
        </div>

        <Link href="/auth/signup/wallet-success" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Complete Sign up</Link>

        <p className="mt-4 text-center text-green-700">I will do this Later</p>
      </div>
    </div>
  );
}
