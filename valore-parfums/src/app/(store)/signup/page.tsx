"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Name, email, and password are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const error = await signup(name, email, phone, password);
      if (error) { setError(error); setLoading(false); return; }
      router.push("/");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-[5%] py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)] mb-3">Join Valore Parfums</p>
          <h1 className="font-serif text-4xl font-light italic">Create Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Sign up to track orders, save favorites, and more
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[rgba(248,113,113,0.08)] border border-[var(--error)] text-[var(--error)] text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-4 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-4 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
              Phone Number <span className="normal-case tracking-normal text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-4 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-4 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
              Confirm Password
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-4 py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--gold)] text-black py-3 rounded text-sm uppercase tracking-wider font-medium hover:bg-[var(--gold-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Creating Account..." : <>Create Account <ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="gold-line my-8" />

        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--gold)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
