import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`
      SELECT NOW() AS server_time, current_database() AS database_name
    `;

    return NextResponse.json({
      success: true,
      message: "Koneksi Neon berhasil",
      data: result[0],
    });
  } catch (error) {
    console.error("Neon connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal. Periksa DATABASE_URL di .env.local",
      },
      { status: 500 },
    );
  }
}