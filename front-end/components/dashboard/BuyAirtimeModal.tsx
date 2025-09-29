import { useState } from "react";

export default function BuyAirtimeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/v1/vtu/mtn/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult("Airtime purchase successful!");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Buy MTN Airtime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="e.g. 08012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₦)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min={50}
              step={50}
              placeholder="100"
            />
          </div>
          {result && <div className="text-green-600 text-sm">{result}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? "Processing..." : "Buy Airtime"}
            </button>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
