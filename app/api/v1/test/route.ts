import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Ensure this env var is set
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM public.reviews');
    await client.end();
    return NextResponse.json({ success: true, message: 'Connected to PostgreSQL', result: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to connect to PostgreSQL', error: (error as Error).message }, { status: 500 });
  }
}