'use server';

const ADMIN_SECRET_API_KEY = process.env.ADMIN_SECRET_API_KEY; // เข้าถึงได้เฉพาะบน Server
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1/admin/generateKey'; // URL เต็มของ API Route ของคุณ

export async function generateKeyAction(discordID: string) {
  if (!ADMIN_SECRET_API_KEY) {
    console.error("ADMIN_SECRET_API_KEY is not set.");
    return { success: false, error: "Server configuration error: API Key missing." };
  }
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not set.");
    return { success: false, error: "Server configuration error: API URL missing." };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ADMIN_SECRET_API_KEY, // **ส่ง API Key ที่นี่ (บน Server)**
      },
      body: JSON.stringify({ discordID }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error:", data);
      return { success: false, error: data.error || 'Failed to generate key' };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error fetching API:", error);
    return { success: false, error: 'An unexpected error occurred while connecting to API.' };
  }
}