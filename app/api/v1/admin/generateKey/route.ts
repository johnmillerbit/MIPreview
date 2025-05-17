import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import pool from "@/lib/db";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { discordID } = await req.json();

    if (!discordID) {
      return NextResponse.json({ error: "Missing discordID" }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/users/${discordID}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "User not found", detail: errorData, discordID }, { status: response.status });
    }

    const user = await response.json();

	const generateKey = await pool.query(`
			insert into keys (key, discordID, username, profile, globalname)
			values
			($1, $2, $3, $4, $5)
			RETURNING *
		`, [uuid(), discordID, user.username, `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`, user.global_name])

    // return NextResponse.json({
    //   id: user.id,
    //   username: user.username,
    //   discriminator: user.discriminator,
    //   avatar: user.avatar,
    //   global_name: user.global_name,
    //   display_avatar_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    // });

	return NextResponse.json(generateKey.rows)
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error", detail: err }, { status: 500 });
  }
}
