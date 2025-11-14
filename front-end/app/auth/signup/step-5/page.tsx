"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupProgress from "@/components/SignupProgress";
import { useUser } from "@/contexts/UserContext";

export default function Step5() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [pw, setPw] = useState("");
  const [cpw, setCPw] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const criteria = [
    { label: '8 to 12 characters', ok: pw.length >= 8 && pw.length <= 12 },
    { label: 'At least 1 number', ok: /\d/.test(pw) },
    { label: 'At least 1 upper case letter', ok: /[A-Z]/.test(pw) },
  ];

  const allCriteriaMet = criteria.every(c => c.ok);
  const passwordsMatch = pw === cpw && cpw.length > 0;
  const canSubmit = allCriteriaMet && passwordsMatch && !isLoading;

  const handleSignup = async () => {
    if (!canSubmit) return;
    
    setError("");
    setIsLoading(true);

    try {
      // Get data from user context
      if (!user?.email || !user?.name) {
        throw new Error("Missing user data. Please start from step 1.");
      }

      // Split name into first and last name
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Call backend signup API
      const response = await fetch("http://localhost:4000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname: firstName,
          lname: lastName,
          email: user.email,
          password: pw,
          // Phone is optional - don't send it if not collected
          // TODO: Add phone collection in signup flow
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Signup failed");
      }

      const data = await response.json();
      
      // Update user context with userId from backend
      updateUser({ userId: data.user.id });

      // Store token
      localStorage.setItem("sliqpay_token", data.token);

      // Navigate to connect wallet
      router.push("/auth/signup/connect-wallet");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/step-4" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={5} />
        <p className="text-xs text-gray-600 mt-1">Step 5</p>

        <h2 className="mt-6 text-xl font-extrabold">Create Password</h2>
        <p className="text-sm text-gray-500">Enter Password for app security</p>

        <div className="mt-6 space-y-4">
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

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button 
          onClick={handleSignup}
          disabled={!canSubmit}
          className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium text-white ${
            canSubmit 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? "Creating account..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
