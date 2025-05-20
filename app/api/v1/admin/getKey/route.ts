import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {

    const host = req.headers.get("host");
        const allowedOrigins = [
            "https://mipreview.netlify.app/",
            "http://192.168.1.26:3000",
        ];

        if (
            !host ||
            !allowedOrigins.includes(`http://${host}` || `https://${host}`)
        ) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

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