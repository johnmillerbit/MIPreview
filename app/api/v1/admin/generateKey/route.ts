import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import pool from "@/lib/db";

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function POST(req: NextRequest) {
    try {
        const { discordID } = await req.json();

        if (!discordID) {
            const res = NextResponse.json(
                { error: "Missing discordID" },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", corsOrigin);
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
                { status: response.status }
            );
            res.headers.set("Access-Control-Allow-Origin", corsOrigin);
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
        const res = NextResponse.json(generateKey.rows);
        res.headers.set("Access-Control-Allow-Origin", corsOrigin);
        return res;
    } catch (err) {
        console.error(err);
        const res = NextResponse.json(
            { error: "Internal Server Error", detail: err },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", corsOrigin);
        return res;
    }
}
