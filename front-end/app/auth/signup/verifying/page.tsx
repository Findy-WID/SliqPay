"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SignupProgress from "@/components/SignupProgress";

export default function Verifying() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push('/auth/signup/step-4'), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/step-3" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={3} />
        <p className="text-xs text-gray-600 mt-1">Step 3</p>

        <div className="mt-12 flex flex-col items-center">
          <div className="h-40 w-40 rounded-xl bg-white shadow flex items-center justify-center">🔎</div>
          <h2 className="mt-8 text-xl font-extrabold">Verifying Documents</h2>
          <p className="mt-2 text-center text-sm text-gray-500">We are Verifying your information withe the public database</p>
          <p className="mt-6 text-sm text-gray-700">Estimated Time:</p>
          <p className="text-2xl font-bold">30s</p>
        </div>
      </div>
    </div>
  );
}
