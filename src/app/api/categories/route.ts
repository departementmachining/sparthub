import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const categories = await sql`
      SELECT
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(sp.id)::int AS total_parts
      FROM categories c
      LEFT JOIN spare_parts sp ON sp.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET categories error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil kategori." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim() || null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description})
      RETURNING id, name, description, created_at
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil ditambahkan.",
        data: result[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST categories error:", error);

    const duplicate =
      error instanceof Error && error.message.includes("duplicate key");

    return NextResponse.json(
      {
        success: false,
        message: duplicate
          ? "Nama kategori sudah digunakan."
          : "Gagal menyimpan kategori.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}