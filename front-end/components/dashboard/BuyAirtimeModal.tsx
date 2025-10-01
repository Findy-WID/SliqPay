import { useState, useEffect } from "react";

export default function BuyAirtimeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  if (!open) return null;

  // Effect to check transaction status
  useEffect(() => {
    // If we have a transaction ID but status is not 'delivered' yet, poll for updates
    if (transactionId && (transactionStatus === 'pending' || !transactionStatus)) {
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/v1/vtu/mtn?request_id=${transactionId}`, {
            credentials: "include" // Include cookies for authentication
          });
          const data = await res.json();
          
          if (res.status === 401) {
            setError("Authentication error while checking status. Please log out and log in again.");
            console.error("Auth error during status check:", data);
            return;
          }
          
          if (res.ok && data.transaction) {
            setTransactionStatus(data.transaction.status);
            
            if (data.transaction.status === 'delivered') {
              setResult("Airtime purchase successful! Your phone has been credited.");
            } else if (data.transaction.status === 'failed') {
              setError("Transaction failed. Please try again.");
            }
          }
        } catch (err) {
          console.error("Error checking transaction status:", err);
        }
      };
      
      // Poll every 5 seconds, but only up to 6 times (30 seconds total)
      let attempts = 0;
      const statusInterval = setInterval(() => {
        attempts++;
        if (attempts <= 6) {
          checkStatus();
        } else {
          clearInterval(statusInterval);
        }
      }, 5000);
      
      return () => clearInterval(statusInterval);
    }
  }, [transactionId, transactionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    setTransactionId(null);
    setTransactionStatus(null);
    
    try {
      const res = await fetch("/api/v1/vtu/mtn/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ phone, amount }),
      });
      
      const data = await res.json();
      
      if (res.status === 401) {
        setError("Authentication error. Please log out and log in again.");
        console.error("Auth error during airtime purchase:", data);
        return;
      }
      
      if (res.ok && data.success) {
        // Store transaction ID for status checks
        setTransactionId(data.transaction?.id || null);
        setTransactionStatus(data.transaction?.status || null);
        
        if (data.transaction?.status === 'delivered') {
          setResult("Airtime purchase successful! Your phone has been credited.");
        } else {
          setResult("Transaction submitted. Checking status...");
        }
      } else {
        setError(data.error || "Failed to purchase airtime");
        console.error("Error response:", data);
      }
    } catch (err: any) {
      console.error("Network error during airtime purchase:", err);
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
          {transactionStatus === 'pending' && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-yellow-700 text-sm">Transaction processing...</p>
            </div>
          )}
          {result && <div className="bg-green-50 p-3 rounded border border-green-200 text-green-700 text-sm">{result}</div>}
          {error && <div className="bg-red-50 p-3 rounded border border-red-200 text-red-700 text-sm">{error}</div>}
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
