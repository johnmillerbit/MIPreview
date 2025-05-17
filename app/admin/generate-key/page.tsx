"use client";
import { useState } from "react";

export default function GenerateKeyPage() {
  const [discordID, setDiscordID] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/v1/admin/generateKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordID }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Generate Review Key</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-4"
      >
        <div>
          <label htmlFor="discordID" className="block text-sm font-medium text-gray-700 mb-1">
            Discord User ID
          </label>
          <input
            id="discordID"
            type="text"
            placeholder="e.g. 123456789012345678"
            value={discordID}
            onChange={(e) => setDiscordID(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 font-semibold text-white rounded-md transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Key"}
        </button>
      </form>

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl mt-6 p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Generated Key</h3>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
