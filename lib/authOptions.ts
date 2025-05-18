import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session, AuthOptions } from "next-auth";
import pool from "@/lib/db";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "username",
                    type: "username",
                    placeholder: "username",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                const admin = await pool.query(
                    `
				select * from admin
				where username = $1
			`,
                    [credentials.username]
                );

                if ((admin.rowCount ?? 0) <= 0) {
                    throw new Error("Invalid email or password");
                }

                if (
                    admin &&
                    (await bcrypt.compare(
                        credentials.password,
                        admin.rows[0].password
                    ))
                ) {
                    return {
                        id: String(admin.rows[0].adminid),
                        username: admin.rows[0].username,
                    };
                } else {
                    throw new Error("Invalid username or password");
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        session: async ({
            session,
            token,
        }: {
            session: Session;
            token: JWT;
        }) => {
            if (session.user) {
                session.user.id = String(token.id);
                session.user.username = token.username;
            }
            return session;
        },
    },
};
