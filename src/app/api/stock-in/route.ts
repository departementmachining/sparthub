import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const transactions = await sql`
      SELECT
        si.id,
        si.transaction_code,
        si.part_id,
        sp.code AS part_code,
        sp.name AS part_name,
        si.supplier_id,
        s.name AS supplier,
        si.warehouse_id,
        w.name AS warehouse,
        si.quantity,
        si.unit_price,
        si.transaction_date,
        si.notes
      FROM stock_in si
      JOIN spare_parts sp ON sp.id = si.part_id
      LEFT JOIN suppliers s ON s.id = si.supplier_id
      LEFT JOIN warehouses w ON w.id = si.warehouse_id
      WHERE
        si.transaction_code ILIKE ${"%" + search + "%"}
        OR sp.code ILIKE ${"%" + search + "%"}
        OR sp.name ILIKE ${"%" + search + "%"}
      ORDER BY si.transaction_date DESC, si.id DESC
    `;

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("GET stock-in error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil transaksi stok masuk." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const partId = Number(body.part_id);
    const quantity = Number(body.quantity);
    const unitPrice = Number(body.unit_price ?? 0);
    const supplierId =
      body.supplier_id == null || body.supplier_id === ""
        ? null
        : Number(body.supplier_id);
    const warehouseId =
      body.warehouse_id == null || body.warehouse_id === ""
        ? null
        : Number(body.warehouse_id);
    const notes = String(body.notes ?? "").trim() || null;

    if (
      !Number.isSafeInteger(partId) ||
      partId <= 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Barang, jumlah, dan harga tidak valid." },
        { status: 400 },
      );
    }

    if (
      (supplierId !== null &&
        (!Number.isSafeInteger(supplierId) || supplierId <= 0)) ||
      (warehouseId !== null &&
        (!Number.isSafeInteger(warehouseId) || warehouseId <= 0))
    ) {
      return NextResponse.json(
        { success: false, message: "Supplier atau gudang tidak valid." },
        { status: 400 },
      );
    }

    const transactionCode =
      "IN-" +
      new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14) +
      "-" +
      Math.random().toString(36).slice(2, 7).toUpperCase();

    const result = await sql.transaction([
      sql`
        UPDATE spare_parts
        SET stock = stock + ${quantity}, updated_at = NOW()
        WHERE id = ${partId}
        RETURNING id, code, name, stock, warehouse_id
      `,
      sql`
        INSERT INTO stock_in (
          transaction_code, part_id, supplier_id, warehouse_id,
          quantity, unit_price, notes
        )
        SELECT
          ${transactionCode}, id, ${supplierId},
          COALESCE(${warehouseId}::bigint, warehouse_id),
          ${quantity}, ${unitPrice}, ${notes}
        FROM spare_parts
        WHERE id = ${partId}
        RETURNING *
      `,
      sql`
        INSERT INTO stock_movements (
          part_id, warehouse_id, movement_type, quantity,
          reference_code, notes
        )
        SELECT
          id, COALESCE(${warehouseId}::bigint, warehouse_id),
          'IN', ${quantity}, ${transactionCode}, ${notes}
        FROM spare_parts
        WHERE id = ${partId}
      `,
    ]);

    const part = result[0][0];

    if (!part) {
      return NextResponse.json(
        { success: false, message: "Spare part tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Stok masuk berhasil disimpan.",
        data: {
          transaction: result[1][0],
          current_stock: Number(part.stock),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST stock-in error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan transaksi stok masuk." },
      { status: 500 },
    );
  }
}