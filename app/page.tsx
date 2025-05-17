import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold mb-2">Shop Review</h1>
      <p className="text-lg text-gray-400">Share your experience. Read reviews. Admins can generate keys for users to submit reviews.</p>
      <div className="flex gap-4">
        <Link href="/reviews" className="card">All Reviews</Link>
        <Link href="/admin/generate-key" className="card">Admin: Generate Key</Link>
        <Link href="/admin/dashboard" className="card">Admin Dashboard</Link>
      </div>
    </div>
  );
}