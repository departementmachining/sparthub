
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const type = searchParams.get("type")?.trim().toUpperCase() ?? "";
    const limitParam = Number(searchParams.get("limit") ?? 100);
    const limit = Number.isFinite(limitParam)
      ? Math.min(500, Math.max(1, Math.floor(limitParam)))
      : 100;

    if (
      type &&
      !["IN", "OUT", "ADJUSTMENT"].includes(type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe pergerakan harus IN, OUT, atau ADJUSTMENT.",
        },
        { status: 400 }
      );
    }

    const movements = await sql`
      SELECT
        sm.id,
        sm.part_id,
        sp.code AS part_code,
        sp.name AS part_name,
        sp.unit,
        sm.warehouse_id,
        w.name AS warehouse,
        sm.movement_type,
        sm.quantity,
        sm.reference_code,
        sm.notes,
        sm.created_at
      FROM stock_movements sm
      JOIN spare_parts sp ON sp.id = sm.part_id
      LEFT JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE
        (
          ${search} = ''
          OR sp.code ILIKE ${"%" + search + "%"}
          OR sp.name ILIKE ${"%" + search + "%"}
          OR COALESCE(sm.reference_code, '') ILIKE ${"%" + search + "%"}
        )
        AND (
          ${type} = ''
          OR sm.movement_type = ${type}
        )
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      total: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error("GET stock movements error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat pergerakan stok.",
      },
      { status: 500 }
    );
  }
}