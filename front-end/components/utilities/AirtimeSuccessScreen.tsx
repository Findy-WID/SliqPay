"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import React from "react";

type Props = {
  amount: number;
  phone: string;
  networkName: string;
  networkLogo?: string;
  onDone?: () => void;
  orderType?: string; // e.g., AIRTIME, DATA, BILLS
  detailLabel?: string; // e.g., Phone Number, Meter Number, Smart Card Number
};

export default function AirtimeSuccessScreen({ amount, phone, networkName, networkLogo, onDone, orderType = "AIRTIME", detailLabel = "Phone Number" }: Props) {
  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="px-4 pt-10 max-w-md mx-auto text-center">
        {/* Animated success badge */}
        <div className="mx-auto h-24 w-24 relative grid place-items-center">
          {/* pulsing rings */}
          <span className="absolute inset-0 rounded-full bg-emerald-100 animate-[ring_1.6s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full bg-emerald-50 animate-[ring_1.6s_ease-out_infinite_0.3s]" />
          {/* static soft background */}
          <div className="absolute inset-2 rounded-full bg-emerald-50" />
          {/* inner check */}
          <div className="relative z-10 h-14 w-14 rounded-full bg-emerald-500 text-white grid place-items-center animate-[pop_420ms_cubic-bezier(.2,.8,.2,1)_forwards]">
            <Check size={28} strokeWidth={3} />
          </div>
          {/* sparkle dots */}
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-70 animate-[spark_1.8s_ease-in-out_infinite]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translate(36px)`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Amount + network pill */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 bg-white">
          <span className="text-emerald-600 font-extrabold">₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
            {networkLogo ? (
              <Image src={networkLogo} alt={networkName} width={20} height={20} className="object-contain rounded-full" />
            ) : (
              <span className="h-5 w-5 rounded-full bg-emerald-100" />
            )}
            <span className="text-gray-900 font-medium">{networkName}</span>
          </span>
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-gray-900">Sent Successfully</h2>

        {/* Details card */}
        <div className="mt-6 rounded-2xl border bg-white text-left">
          <div className="px-4 py-3 border-b text-sm font-semibold text-gray-900">Transaction Details</div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">{detailLabel}</span>
            <span className="font-semibold text-gray-900">{phone}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">Order Type</span>
            <span className="font-extrabold text-gray-900">{orderType}</span>
          </div>
        </div>

        {onDone && (
          <button onClick={onDone} className="mt-8 w-full rounded-xl bg-green-600 text-white py-3 font-semibold">
            Done
          </button>
        )}
      </div>
      {/* Animations */}
      <style jsx>{`
        @keyframes ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes pop {
          0% { transform: scale(0.8); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes spark {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--r,0)) translate(32px); opacity: .0; }
          20% { opacity: .9; }
          60% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
