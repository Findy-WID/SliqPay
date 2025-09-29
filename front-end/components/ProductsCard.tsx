"use client";

import { useState } from "react";
// import { sendMtnVtu } from "@/lib/vtpass"; // Not needed on client, handled via API route

type Product = { id: number; amount: number; description: string };

function SuccessModal({ open, onClose, message }: { open: boolean; onClose: () => void; message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-lg flex flex-col items-center">
        <svg className="h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#dcfce7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
        </svg>
        <div className="text-green-700 text-lg font-semibold mb-2">Success!</div>
        <div className="text-gray-700 text-center mb-4">{message}</div>
        <button className="bg-green-600 text-white px-6 py-2 rounded font-medium" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function ProductCard({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const product = products.find((p) => p.id === selected);
      if (!product) throw new Error("No product selected");
      if (!phone) throw new Error("Phone number is required");
      const res = await fetch("/api/v1/vtu/mtn/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: product.amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult("Airtime purchase successful!");
        setPhone("");
        setShowSuccess(true);
        // Do not reset selected here, so user can send again easily
      } else {
        setError(data.error || "Failed to purchase airtime");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <div className="flex gap-3 mb-6">
        {products.map((pro) => (
          <button
            key={pro.id}
            type="button"
            tabIndex={0}
            aria-pressed={selected === pro.id}
            onClick={() => setSelected(pro.id)}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelected(pro.id)}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${selected === pro.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            {pro.description}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <input
            type="tel"
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
            autoFocus
          />
          <button
            className="w-full py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
            onClick={handlePurchase}
            disabled={loading || !phone}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Processing...
              </span>
            ) : (
              <>Send {products.find((p) => p.id === selected)?.description}</>
            )}
          </button>
          {error && <div className="text-red-600 text-sm text-center font-medium bg-red-50 border border-red-200 rounded p-2 mt-2">{error}</div>}
        </div>
      )}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} message={result || "Airtime purchase successful!"} />
    </div>
  );
}
