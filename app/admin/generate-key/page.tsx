"use client";

import { useState } from "react";
import { KeyRound, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import Link from "next/link";

export default function GenerateKeyPage() {
  const [discordID, setDiscordID] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);

  async function handleGenerateKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setKey(null);

    try {
      const res = await fetch("/api/v1/admin/generateKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordID }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate key.");
      } else {
        const data = await res.json();
        setKey(data[0].key);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 text-slate-100 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-sky-500/20 p-3 rounded-full mb-4">
            <KeyRound size={40} className="text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            Generate New Access Key
          </h1>
          <p className="text-slate-400 mt-2">Enter a Discord User ID to create a unique access key.</p>
        </header>

        <main className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 border border-slate-700">
          <form className="space-y-6" onSubmit={handleGenerateKey}>
            <div>
              <label htmlFor="discordID" className="block text-sm font-medium text-slate-300 mb-1.5">
                Discord User ID
              </label>
              <div className="relative">
                <input
                  id="discordID"
                  type="text"
                  placeholder="e.g., 123456789012345678"
                  required
                  value={discordID}
                  onChange={e => setDiscordID(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 font-semibold text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 bg-sky-500 hover:bg-sky-600 disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="mr-2 animate-spin" /> : <KeyRound size={20} className="mr-2" />}
              {loading ? "Generating..." : "Generate Key"}
            </button>

            {error && (
              <div className="flex items-center text-red-400 mt-2 text-sm">
                <XCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            {key && (
              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center mt-4 space-x-2">
                  <span className="text-sky-300 font-mono">{window.location.origin}/review/{key}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/review/${key}`);
                    }}
                    className="ml-2 px-2 py-1 bg-sky-700 hover:bg-sky-600 text-xs rounded text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </form>
        </main>

        <footer className="mt-8 text-center">
          <Link
            href={"/admin/dashboard"}
            className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 hover:underline transition-colors"
          >
            <ArrowLeft size={18} className="mr-1.5" />
            Back to Admin Dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}