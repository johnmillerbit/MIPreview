"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function ReviewKeyPage() {
  const { key } = useParams<{ key: string }>();
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(5);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/v1/user/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment, rate, key }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Submit Your Review</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-5"
      >
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select
            id="rate"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 && "s"}
              </option>
            ))}
          </select>
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
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl mt-6 p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Server Response</h3>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
