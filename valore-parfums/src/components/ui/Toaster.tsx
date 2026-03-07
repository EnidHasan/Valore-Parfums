"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let addToastFn: ((t: Omit<Toast, "id">) => void) | null = null;

export function toast(message: string, type: Toast["type"] = "info") {
  addToastFn?.({ message, type });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  const iconColor = (type: Toast["type"]) => {
    switch (type) {
      case "success": return "text-[var(--success)]";
      case "error": return "text-[var(--error)]";
      default: return "text-[var(--gold)]";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-fade-up bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 shadow-xl flex items-center gap-3 min-w-[280px]"
        >
          <span className={`text-lg ${iconColor(t.type)}`}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="text-sm text-[var(--text-primary)]">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
