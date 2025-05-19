"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star, Loader2, CheckCircle, XCircle, Send } from 'lucide-react';
import Link from "next/link";

export default function ReviewKeyPage() {
  const { key } = useParams<{ key: string }>();
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/user/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, rate, key }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Failed to submit review.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRate(star)}
            className={`p-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full transition-colors ${
              star <= rate ? "text-amber-400" : "text-yellow-600"
            }`}
          >
            <Star size={24} fill={star <= rate ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-yellow-800 p-4 md:p-8 text-yellow-100 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-yellow-500/20 p-3 rounded-full mb-4">
            <Star size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-300">
            ส่งรีวิวของคุณ
          </h1>
          <p className="text-yellow-300 mt-2">แบ่งปันความคิดเห็นและให้คะแนนประสบการณ์ของคุณ</p>
        </header>

        <main className="bg-yellow-800 rounded-xl shadow-2xl p-6 md:p-8 border border-yellow-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-yellow-300 mb-1.5">
                รีวิวของคุณ
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="เขียนรีวิวของคุณ..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-yellow-700 text-yellow-200 border border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors placeholder-yellow-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-300 mb-1.5">
                คะแนน
              </label>
              <StarRating />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 font-semibold text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Send size={20} className="mr-2" />}
              {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
            </button>

            {error && (
              <div className="flex items-center text-red-400 mt-2 text-sm">
                <XCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center text-green-400 mt-2 text-sm">
                <CheckCircle size={18} className="mr-2" />
                ส่งรีวิวสำเร็จแล้ว!
              </div>
            )}
          </form>
        </main>

        <footer className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </footer>
      </div>
    </div>
  );
}
