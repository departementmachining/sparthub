import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const adjustments = await sql`
      SELECT
        sm.id,
        sm.part_id,
        sp.code AS part_code,
        sp.name AS part_name,
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
      WHERE sm.movement_type = 'ADJUSTMENT'
      ORDER BY sm.created_at DESC, sm.id DESC
    `;

    return NextResponse.json({
      success: true,
      data: adjustments,
    });
  } catch (error) {
    console.error("GET stock adjustments error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat adjustment." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const partId = Number(body.part_id);
    const physicalStock = Number(body.physical_stock);
    const notes = String(body.notes ?? "").trim();

    if (
      !Number.isSafeInteger(partId) ||
      partId <= 0 ||
      !Number.isFinite(physicalStock) ||
      physicalStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang dan stok fisik harus diisi dengan nilai yang valid.",
        },
        { status: 400 },
      );
    }

    if (!notes) {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan adjustment wajib diisi.",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE spare_parts
      SET
        stock = ${physicalStock},
        updated_at = NOW()
      WHERE id = ${partId}
      RETURNING id, code, name, stock, warehouse_id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Spare part tidak ditemukan." },
        { status: 404 },
      );
    }

    const part = result[0];
    const previousStock = Number(part.stock);
    const difference = physicalStock - previousStock;

    if (difference !== 0) {
      await sql`
        INSERT INTO stock_movements (
          part_id,
          warehouse_id,
          movement_type,
          quantity,
          reference_code,
          notes
        )
        VALUES (
          ${partId},
          ${part.warehouse_id},
          'ADJUSTMENT',
          ${Math.abs(difference)},
          ${"ADJ-" + Date.now()},
          ${notes + " (selisih: " + difference + ")"}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message:
        difference === 0
          ? "Stok sudah sesuai. Tidak ada perubahan."
          : "Stock adjustment berhasil disimpan.",
      data: {
        part_id: part.id,
        code: part.code,
        name: part.name,
        previous_stock: previousStock,
        physical_stock: physicalStock,
        difference,
      },
    });
  } catch (error) {
    console.error("POST stock adjustment error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menyimpan stock adjustment." },
      { status: 500 },
    );
  }
}