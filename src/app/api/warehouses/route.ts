import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const warehouses = await sql`
      SELECT
        w.id,
        w.name,
        w.location,
        w.created_at,
        COUNT(sp.id)::int AS total_parts
      FROM warehouses w
      LEFT JOIN spare_parts sp ON sp.warehouse_id = w.id
      GROUP BY w.id
      ORDER BY w.name ASC
    `;

    return NextResponse.json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    console.error("GET warehouses error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data gudang." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const location = String(body.location ?? "").trim() || null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama gudang wajib diisi." },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO warehouses (name, location)
      VALUES (${name}, ${location})
      RETURNING id, name, location, created_at
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Gudang berhasil ditambahkan.",
        data: result[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST warehouses error:", error);

    const duplicate =
      error instanceof Error && error.message.includes("duplicate key");

    return NextResponse.json(
      {
        success: false,
        message: duplicate
          ? "Nama gudang sudah digunakan."
          : "Gagal menyimpan data gudang.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}