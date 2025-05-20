import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import pool from "@/lib/db";

// ควรใช้ค่าจาก Environment Variable เสมอ
// ตรวจสอบให้แน่ใจว่า CORS_ORIGIN ถูกตั้งค่าใน Netlify ENV
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000"; 
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ** API Key ที่ใช้ในการยืนยันตัวตน **
// ตั้งค่าใน Netlify Environment Variables: ADMIN_SECRET_API_KEY = "your_strong_secret_key_here"
const ADMIN_SECRET_API_KEY = process.env.ADMIN_SECRET_API_KEY;

// กำหนด CORS Headers ที่จะใช้ซ้ำๆ
const commonCORSHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key", // เพิ่ม X-API-Key
    "Access-Control-Allow-Credentials": "true",
};

// Handler สำหรับ Preflight Request (OPTIONS)
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: commonCORSHeaders });
}

export async function POST(req: NextRequest) {
    // 1. **ตรวจสอบ API Key ก่อนอื่นใด**
    const apiKey = req.headers.get("x-api-key"); // หรือใช้ "Authorization: Bearer YOUR_API_KEY"
    
    if (!ADMIN_SECRET_API_KEY || apiKey !== ADMIN_SECRET_API_KEY) {
        const res = NextResponse.json(
            { error: "Unauthorized: Invalid or missing API Key" },
            { status: 401, headers: commonCORSHeaders }
        );
        return res;
    }

    // ส่วนโค้ดเดิมของคุณที่เหลืออยู่
    try {
        const { discordID } = await req.json();

        if (!discordID) {
            const res = NextResponse.json(
                { error: "Missing discordID" },
                { status: 400, headers: commonCORSHeaders }
            );
            return res;
        }

        const response = await fetch(
            `https://discord.com/api/v10/users/${discordID}`,
            {
                headers: {
                    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            const res = NextResponse.json(
                { error: "User not found", detail: errorData, discordID },
                { status: response.status, headers: commonCORSHeaders }
            );
            return res;
        }

        const user = await response.json();

        const generateKey = await pool.query(
            `
      insert into public.keys (key, discordID, username, profile, globalname)
      values
      ($1, $2, $3, $4, $5)
      RETURNING *
    `,
            [
                uuid(),
                discordID,
                user.username,
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                user.global_name,
            ]
        );
        const res = NextResponse.json(generateKey.rows, { headers: commonCORSHeaders });
        return res;
    } catch (err) {
        console.error(err);
        const res = NextResponse.json(
            { error: "Internal Server Error", detail: err },
            { status: 500, headers: commonCORSHeaders }
        );
        return res;
    }
}