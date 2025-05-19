import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM public.reviews
    `);
    const totalReviews = parseInt(countResult.rows[0].count, 10);

    const sumResult = await pool.query(`
      SELECT SUM(rate) FROM public.reviews
    `);
    const totalRatingSum = sumResult.rows[0].sum ? parseInt(sumResult.rows[0].sum, 10) : 0;

    const { rows } = await pool.query(
      `
      SELECT
        reviews.comment,
        reviews.rate,
        reviews.created_at,
        reviews.keyid,
        keys.globalname,
        keys.profile
      FROM public.keys
      INNER JOIN public.reviews ON keys.keyid = reviews.keyid
      ORDER BY reviews.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalReviews / limit);

    const res = NextResponse.json({
      reviews: rows,
      total: totalReviews,
      totalReviews: totalReviews,
      totalRatingSum: totalRatingSum,
      totalPages,
      page,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    const res = NextResponse.json(
      { error: "Internal Server Error", detail: (err as Error).message },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
