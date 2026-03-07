"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toaster";

interface StockRequest {
  id: string;
  perfumeName: string;
  customerName: string;
  customerPhone: string;
  desiredMl: number;
  quantity: number;
  status: string;
  createdAt: string;
}

export default function StockRequestsPage() {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/stock-requests")
      .then((r) => r.json())
      .then(setRequests)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/stock-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast(`Request ${status.toLowerCase()}`, "success");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light">Stock Requests</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Customer requests for out-of-stock perfumes</p>
        <div className="gold-line mt-3" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">No stock requests yet</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Perfume</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Customer</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Phone</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">ML</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Qty</th>
              <th className="text-center py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Status</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Date</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--gold-tint)] transition-colors">
                <td className="py-3 px-4 font-serif">{r.perfumeName}</td>
                <td className="py-3 px-4">{r.customerName}</td>
                <td className="py-3 px-4 text-[var(--text-secondary)]">{r.customerPhone}</td>
                <td className="py-3 px-4 text-right font-mono">{r.desiredMl}</td>
                <td className="py-3 px-4 text-right font-mono">{r.quantity}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                    r.status === "Pending" ? "status-pending" :
                    r.status === "Fulfilled" ? "status-completed" : "status-cancelled"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  {r.status === "Pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => updateStatus(r.id, "Fulfilled")}
                        className="px-2 py-1 text-[10px] uppercase tracking-wider bg-[rgba(74,222,128,0.1)] text-[var(--success)] rounded hover:bg-[rgba(74,222,128,0.2)] transition-colors"
                      >
                        Fulfill
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "Declined")}
                        className="px-2 py-1 text-[10px] uppercase tracking-wider bg-[rgba(248,113,113,0.1)] text-[var(--error)] rounded hover:bg-[rgba(248,113,113,0.2)] transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
