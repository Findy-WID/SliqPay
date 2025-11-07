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
          <VerifyAnimation />
          <h2 className="mt-8 text-xl font-extrabold">Verifying Documents</h2>
          <p className="mt-2 text-center text-sm text-gray-500">We’re verifying your information with the public database</p>
          <p className="mt-6 text-sm text-gray-700">Estimated Time:</p>
          <p className="text-2xl font-bold">30s</p>
        </div>
      </div>
    </div>
  );
}

function VerifyAnimation() {
  return (
    <div className="h-40 w-40 rounded-xl bg-white shadow flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Verifying">
        {/* Document */}
        <g>
          <rect x="28" y="20" width="84" height="100" rx="12" fill="#E9F5FF" stroke="#CDEAFE"/>
          <rect x="38" y="38" width="64" height="6" rx="3" fill="#BFE1FF"/>
          <rect x="38" y="52" width="52" height="6" rx="3" fill="#D4EAFF"/>
          <rect x="38" y="66" width="58" height="6" rx="3" fill="#D4EAFF"/>
          <rect x="38" y="80" width="44" height="6" rx="3" fill="#D4EAFF"/>
        </g>

        {/* Scanning sheen */}
        <g className="scanbar" opacity="0.7">
          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0"/>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </linearGradient>
          <rect x="-140" y="22" width="120" height="96" fill="url(#scanGrad)" transform="rotate(20 0 0)"/>
        </g>

        {/* Magnifying glass */}
        <g className="mag" style={{transformOrigin: '80px 78px'}}>
          <circle cx="80" cy="78" r="16" fill="#fff" stroke="#22C55E" strokeWidth="4"/>
          <rect x="91" y="88" width="18" height="6" rx="3" fill="#16A34A" transform="rotate(40 91 88)"/>
        </g>

        {/* Sparkles */}
        <circle className="spark s1" cx="32" cy="36" r="3" fill="#34D399"/>
        <circle className="spark s2" cx="108" cy="36" r="2.5" fill="#86EFAC"/>
        <circle className="spark s3" cx="28" cy="96" r="2.5" fill="#86EFAC"/>
        <circle className="spark s4" cx="112" cy="96" r="3" fill="#34D399"/>
      </svg>
      <style jsx>{`
        .mag { animation: mag-scan 2.2s ease-in-out infinite; transform-box: fill-box; }
        .scanbar { animation: scan-move 2s linear infinite; }
        .spark { opacity: 0; animation: spark-pulse 1.8s ease-in-out infinite; }
        .spark.s2 { animation-delay: .3s; }
        .spark.s3 { animation-delay: .6s; }
        .spark.s4 { animation-delay: .9s; }

        @keyframes mag-scan {
          0%   { transform: translate(-8px, -6px) rotate(-6deg); }
          50%  { transform: translate(8px, 4px) rotate(6deg); }
          100% { transform: translate(-8px, -6px) rotate(-6deg); }
        }
        @keyframes scan-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(240px); }
        }
        @keyframes spark-pulse {
          0%,100% { transform: scale(.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
