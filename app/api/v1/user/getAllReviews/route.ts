import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
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
    `);

    const res = NextResponse.json(rows);
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
