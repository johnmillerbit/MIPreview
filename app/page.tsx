"use client";
import { useEffect, useState, useMemo } from "react";
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

type ApiResponse = {
  reviews: Review[];
  totalPages: number;
  totalReviews: number;
  totalRatingSum: number;
  total?: number;
};

// Component to display stars based on a rating and size
const StarDisplay = ({ rating, size = 18 }: { rating: number; size?: number }) => {
  // const filledStars = Math.floor(rating);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "text-amber-400" : "text-slate-600"}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};


export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalRatingSum, setTotalRatingSum] = useState(0);
  const REVIEWS_PER_PAGE = 5;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/user/getAllReviews?page=${page}&limit=${REVIEWS_PER_PAGE}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setReviews(data.reviews || data);
        setTotalPages(
          data.totalPages ||
          Math.ceil((data.total || (data.reviews?.length ?? 0)) / REVIEWS_PER_PAGE)
        );
        if (data.totalReviews !== undefined && data.totalRatingSum !== undefined) {
          setTotalReviews(data.totalReviews);
          setTotalRatingSum(data.totalRatingSum);
        } else if (data.total !== undefined) {
          setTotalReviews(data.total);
          setTotalRatingSum(reviews.reduce((sum, review) => sum + review.rate, 0));
        } else {
          setTotalReviews(reviews.length);
          setTotalRatingSum(reviews.reduce((sum, review) => sum + review.rate, 0));
        }
      })
      .catch((error) => console.error("Failed to fetch reviews:", error))
      .finally(() => setLoading(false));
  }, []);

  const overallAverageRating = useMemo(() => {
    if (totalReviews === 0) return 0;
    return (totalRatingSum / totalReviews);
  }, [totalRatingSum, totalReviews]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-yellow-800 p-4 md:p-8 text-yellow-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center bg-yellow-500/20 p-3 rounded-full mb-4">
            <Star size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-300">
            รีวิวจากผู้ใช้
          </h1>
          <div className="flex flex-col items-center mt-4">
             <p className="text-yellow-300 mb-2 text-lg">คะแนนเฉลี่ยโดยรวม:</p>
             <div className="flex items-center justify-center">
                <StarDisplay rating={overallAverageRating} size={28} />
                <span className="ml-3 text-2xl font-bold text-yellow-200">{overallAverageRating.toFixed(1)} / 5</span>
             </div>
             <p className="text-yellow-300 mt-2 text-sm">จาก {totalReviews} รีวิว</p>
          </div>
          <p className="text-yellow-300 mt-4">ดูว่าคนอื่นพูดถึงบริการของเราว่าอย่างไรบ้าง</p>
        </header>

        <main>
          {loading && reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 size={48} className="text-yellow-400 animate-spin mb-4" />
              <p className="text-yellow-300">กำลังโหลดรีวิว...</p>
            </div>
          ) : reviews.length === 0 && !loading ? (
            <div className="bg-yellow-800/50 rounded-xl p-12 text-center border border-yellow-700">
              <p className="text-yellow-300 text-lg">ยังไม่มีรีวิว</p>
              <Link
                href="/review"
                className="mt-4 inline-block py-2 px-4 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-medium transition-colors"
              >
                เป็นคนแรกที่แสดงความคิดเห็น
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.keyid}
                    className="bg-yellow-800 rounded-xl shadow-lg p-6 border border-yellow-700 hover:border-yellow-600 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-yellow-600 bg-yellow-700 flex-shrink-0">
                        <Image
                          src={review.profile || "/default-avatar.png"}
                          alt={review.globalname}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-yellow-200">{review.globalname}</p>
                        <p className="text-sm text-yellow-300">
                          {review.created_at && new Date(review.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <StarDisplay rating={review.rate} /> {/* Use the consolidated component */}
                      </div>
                    </div>

                    <p className="text-yellow-100 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 rounded bg-yellow-700 text-yellow-100 disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-yellow-300">
                    หน้า {page} จาก {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-4 py-2 rounded bg-yellow-700 text-yellow-100 disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
