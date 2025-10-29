"use client";

import Link from "next/link";
import SignupProgress from "@/components/SignupProgress";

export default function Step4() {
  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/step-3" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={4} />
        <p className="text-xs text-gray-600 mt-1">Step 4</p>

        <h2 className="mt-6 text-xl font-extrabold">Confirm Information</h2>
        <p className="text-sm text-gray-500">By continuing, you agree that the information captured below is accurate</p>

        <div className="mt-6 space-y-5 text-gray-800">
          <div>
            <p className="text-xs text-gray-500">Full Name</p>
            <p className="font-medium">Maryam Oluwabunmi Lawal</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">NIN</p>
            <p className="font-medium">012345678901</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date of Birth</p>
            <p className="font-medium">1000-01-01</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="font-medium">Sample street, Sample city, Sample state, Nigeria</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">Entered Wrong NIN? <span className="text-blue-600">Try Again</span></p>

        <Link href="/auth/signup/step-5" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">Continue</Link>
      </div>
    </div>
  );
}
