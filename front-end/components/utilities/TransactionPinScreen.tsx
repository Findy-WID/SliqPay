"use client";

import { ArrowLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  onBack: () => void;
  onSubmit: (pin: string) => void;
};

export default function TransactionPinScreen({ onBack, onSubmit }: Props) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);

  const canSubmit = useMemo(() => digits.every((d) => d !== ""), [digits]);

  const push = (d: string) => {
    setDigits((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x === "");
      if (idx !== -1) next[idx] = d;
      return next;
    });
  };

  const pop = () => {
    setDigits((prev) => {
      const next = [...prev];
      const idx = [...next].reverse().findIndex((x) => x !== "");
      if (idx !== -1) next[3 - idx] = ""; // map reversed index back
      return next;
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(digits.join(""));
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"];
  const [animateComplete, setAnimateComplete] = useState(false);

  useEffect(() => {
    if (canSubmit) {
      // Trigger completion animation once all digits are filled
      const t = setTimeout(() => setAnimateComplete(true), 120);
      return () => clearTimeout(t);
    } else {
      setAnimateComplete(false);
    }
  }, [canSubmit]);

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <div className="px-4 pt-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Go back">
          <ArrowLeft size={22} className="text-gray-900" />
        </button>
      </div>

      <div className="px-4 mt-8 max-w-md mx-auto text-center">
        {/* Icon from reference: refined sizing + animated dots/lock */}
        <div className="mx-auto mb-5 h-20 w-32 grid place-items-center">
          <div className="relative">
            {/* Speech bubble */}
            <svg width="120" height="68" viewBox="0 0 120 68" fill="none" className="drop-shadow-sm">
              <rect x="12" y="6" width="96" height="44" rx="12" fill="#C5FAD8" />
              {[32, 54, 76].map((cx, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={28}
                  r={6}
                  className={`fill-[#008A3A] bubble-dot ${animateComplete ? 'bubble-dot-complete' : ''}`}
                  style={{ animationDelay: `${i * 180}ms` }}
                />
              ))}
            </svg>
            {/* Lock */}
            <div className={`absolute right-0 bottom-0 translate-y-12 lock-wrapper ${animateComplete ? 'lock-complete' : ''}`}>
              <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                <rect x="14" y="30" width="42" height="30" rx="8" fill="#008A3A" />
                <path d="M26 30v-4.2C26 18.9 30 14 35 14s9 4.9 9 11.8V30" stroke="#008A3A" strokeWidth="12" strokeLinecap="round" />
                <rect x="32" y="42" width="6" height="12" rx="3" fill="white" />
              </svg>
            </div>
          </div>
        </div>

  <h2 className="text-lg font-extrabold text-gray-900 mt-2">Input Transaction PIN</h2>
  <p className="mt-1 text-sm text-gray-600">Enter your 4 - digit Transaction PIN to complete Purchase</p>

        {/* PIN boxes */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {digits.map((d, i) => (
            <div key={i} className="h-14 w-14 rounded-2xl bg-gray-100 grid place-items-center text-xl font-semibold text-gray-800 shadow-sm">
              {d || ""}
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div className="mt-9 grid grid-cols-3 gap-10 text-2xl font-medium text-gray-900 select-none">
          {keypad.map((k, i) => (
            <button
              key={i}
              onClick={() => (k === "←" ? pop() : k !== "" ? push(k) : null)}
              className={`h-10 ${k === "" ? "pointer-events-none" : ""}`}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`mt-10 w-full rounded-xl py-4 font-semibold ${
            canSubmit ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          Submit
        </button>
      </div>
      {/* Animations */}
      <style jsx>{`
        .bubble-dot { animation: pulse 2.4s ease-in-out infinite; transform-origin: center; }
        .bubble-dot-complete { animation: pulseComplete 0.6s ease forwards; }
        .lock-wrapper { animation: lockEnter 0.7s cubic-bezier(0.32,0.72,0.32,1.2); }
        .lock-complete { animation: lockCelebrate 0.8s ease forwards; }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.85); opacity: 0.75; } }
        @keyframes pulseComplete { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes lockEnter { 0% { transform: translateY(30px) scale(0.9); opacity:0; } 100% { transform: translateY(0) scale(1); opacity:1; } }
        @keyframes lockCelebrate { 0% { transform: translateY(0) rotate(0deg); } 40% { transform: translateY(-6px) rotate(-3deg); } 70% { transform: translateY(2px) rotate(3deg); } 100% { transform: translateY(0) rotate(0deg); } }
      `}</style>
    </div>
  );
}
