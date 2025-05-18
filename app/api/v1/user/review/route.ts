import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { comment, rate, key } = await req.json();

        if (!key) {
            return NextResponse.json(
                { error: "Key is required" },
                { status: 400 }
            );
        }

		if (!comment) {
            return NextResponse.json(
                { error: "comment is required" },
                { status: 400 }
            );
        }

		if (!rate) {
            return NextResponse.json(
                { error: "rate is required" },
                { status: 400 }
            );
        }
		
        const getKeyID = await pool.query(
            `
					select keyid, isused from keys
					where key = $1
				`,
            [key]
        );

        const isKeyUsed = await pool.query(
            `
				select keyid from reviews
				where keyid = $1
			`,
            [getKeyID.rows[0].keyid]
        );

		if (isKeyUsed.rowCount !== 0) {
			return NextResponse.json({msg: "Alredy have this key"}, {status: 400})
		}

        if (getKeyID.rows.length !== 0) {
            if (getKeyID.rows[0].isused === false) {
                const client = await pool.connect();
                try {
                    await client.query("BEGIN");

                    await client.query(
                        `
						INSERT INTO public.reviews (comment, rate, keyid)
						VALUES ($1, $2, $3)
        `,
                        [comment, rate, getKeyID.rows[0].keyid]
                    );

                    await client.query(
                        `
						UPDATE public.keys
						SET isused = true
						WHERE keyid = $1
        `,
                        [getKeyID.rows[0].keyid]
                    );

                    await client.query("COMMIT");

                    return NextResponse.json(
                        { message: "Review submitted successfully" },
                        { status: 201 }
                    );
                } catch (err) {
                    await client.query("ROLLBACK");
                    throw err;
                } finally {
                    client.release();
                }
            } else {
                return NextResponse.json(
                    { msg: "The key was used" },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json({ mes: "No keyID" }, { status: 400 });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { err: "Internal server error" },
            { status: 500 }
        );
    }
}
