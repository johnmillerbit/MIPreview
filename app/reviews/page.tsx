"use client";
import { useEffect, useState } from "react";

type Review = {
  globalname: string;
  comment: string;
  rate: number;
  keyid: number;
  created_at?: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/user/getAllReviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        All Reviews
      </h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-500">No reviews yet.</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div
              key={r.keyid}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">
                    {"★".repeat(r.rate) + "☆".repeat(5 - r.rate)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {r.created_at && new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-lg font-semibold text-gray-700">
                {r.globalname}
              </p>
              <p className="text-gray-600 mt-2">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
