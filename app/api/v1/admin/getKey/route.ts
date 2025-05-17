import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query("SELECT * FROM keys ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error", detail: err }, { status: 500 });
  }
}