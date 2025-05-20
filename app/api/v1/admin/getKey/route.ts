import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM public.keys ORDER BY created_at DESC");
    const res = NextResponse.json(result.rows);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Internal Server Error", detail: err }, { status: 500 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}