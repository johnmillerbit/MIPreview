"use client";
import { useEffect, useState } from "react";
import { Star, Loader2 } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

type Review = {
  globalname: string;
  comment: string;
  rate: number;
  keyid: number;
  created_at?: string;
  profile: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/user/getAllReviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((error) => console.error("Failed to fetch reviews:", error))
      .finally(() => setLoading(false));
  }, []);

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={star <= rating ? "text-amber-400" : "text-slate-600"} 
            fill={star <= rating ? "currentColor" : "none"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center bg-sky-500/20 p-3 rounded-full mb-4">
            <Star size={40} className="text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            User Reviews
          </h1>
          <p className="text-slate-400 mt-2">See what others are saying about our service.</p>
        </header>

        <main>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 size={48} className="text-sky-400 animate-spin mb-4" />
              <p className="text-slate-400">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-slate-400 text-lg">No reviews yet.</p>
              <Link 
                href="/review" 
                className="mt-4 inline-block py-2 px-4 bg-sky-500 hover:bg-sky-600 rounded-lg text-white font-medium transition-colors"
              >
                Be the first to leave a review
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.keyid}
                  className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-600 bg-slate-700 flex-shrink-0">
                      <Image
                        src={review.profile || "/default-avatar.png"}
                        alt={review.globalname}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-slate-200">{review.globalname}</p>
                      <p className="text-sm text-slate-400">
                        {review.created_at && new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <StarRating rating={review.rate} />
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 hover:underline transition-colors"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}