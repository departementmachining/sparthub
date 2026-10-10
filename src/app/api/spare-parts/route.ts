import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const parts = await sql`
      SELECT
        sp.id,
        sp.code,
        sp.name,
        sp.category_id,
        c.name AS category,
        sp.warehouse_id,
        w.name AS warehouse,
        sp.unit,
        sp.stock,
        sp.min_stock,
        sp.purchase_price,
        sp.selling_price,
        sp.description,
        sp.created_at,
        sp.updated_at
      FROM spare_parts sp
      LEFT JOIN categories c ON c.id = sp.category_id
      LEFT JOIN warehouses w ON w.id = sp.warehouse_id
      WHERE
        sp.code ILIKE ${"%" + search + "%"}
        OR sp.name ILIKE ${"%" + search + "%"}
      ORDER BY sp.id DESC
    `;

    return NextResponse.json({
      success: true,
      data: parts,
    });
  } catch (error) {
    console.error("GET spare parts error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data spare part." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body.code ?? "").trim();
    const name = String(body.name ?? "").trim();
    const unit = String(body.unit ?? "pcs").trim() || "pcs";
    const description = String(body.description ?? "").trim() || null;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, message: "Kode dan nama spare part wajib diisi." },
        { status: 400 },
      );
    }

    const stock = Number(body.stock ?? 0);
    const minStock = Number(body.min_stock ?? 0);
    const purchasePrice = Number(body.purchase_price ?? 0);
    const sellingPrice = Number(body.selling_price ?? 0);

    if (
      !Number.isFinite(stock) ||
      !Number.isFinite(minStock) ||
      !Number.isFinite(purchasePrice) ||
      !Number.isFinite(sellingPrice) ||
      stock < 0 ||
      minStock < 0 ||
      purchasePrice < 0 ||
      sellingPrice < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Nilai stok dan harga harus berupa angka positif atau nol." },
        { status: 400 },
      );
    }

    const categoryId =
      body.category_id === "" || body.category_id == null
        ? null
        : Number(body.category_id);

    const warehouseId =
      body.warehouse_id === "" || body.warehouse_id == null
        ? null
        : Number(body.warehouse_id);

    if (
      (categoryId !== null &&
        (!Number.isSafeInteger(categoryId) || categoryId <= 0)) ||
      (warehouseId !== null &&
        (!Number.isSafeInteger(warehouseId) || warehouseId <= 0))
    ) {
      return NextResponse.json(
        { success: false, message: "Kategori atau gudang tidak valid." },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO spare_parts (
        code,
        name,
        category_id,
        warehouse_id,
        unit,
        stock,
        min_stock,
        purchase_price,
        selling_price,
        description
      )
      VALUES (
        ${code},
        ${name},
        ${categoryId},
        ${warehouseId},
        ${unit},
        ${stock},
        ${minStock},
        ${purchasePrice},
        ${sellingPrice},
        ${description}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Spare part berhasil ditambahkan.",
        data: result[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST spare parts error:", error);

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "Kode spare part sudah digunakan."
        : "Gagal menyimpan spare part. Periksa data kategori, gudang, dan database.";

    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}