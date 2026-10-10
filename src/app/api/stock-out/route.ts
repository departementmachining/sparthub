
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const transactions = await sql`
      SELECT
        so.id,
        so.transaction_code,
        so.part_id,
        sp.code AS part_code,
        sp.name AS part_name,
        so.warehouse_id,
        w.name AS warehouse,
        so.quantity,
        so.recipient,
        so.purpose,
        so.transaction_date
      FROM stock_out so
      JOIN spare_parts sp ON sp.id = so.part_id
      LEFT JOIN warehouses w ON w.id = so.warehouse_id
      WHERE
        so.transaction_code ILIKE ${"%" + search + "%"}
        OR sp.code ILIKE ${"%" + search + "%"}
        OR sp.name ILIKE ${"%" + search + "%"}
        OR COALESCE(so.recipient, '') ILIKE ${"%" + search + "%"}
      ORDER BY so.transaction_date DESC, so.id DESC
    `;

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("GET stock-out error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat stok keluar.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const partId = Number(body.part_id);
    const quantity = Number(body.quantity);

    const warehouseId =
      body.warehouse_id == null || body.warehouse_id === ""
        ? null
        : Number(body.warehouse_id);

    const recipient = String(body.recipient ?? "").trim();
    const purpose = String(body.purpose ?? "").trim();

    if (
      !Number.isSafeInteger(partId) ||
      partId <= 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang dan jumlah stok keluar harus valid.",
        },
        { status: 400 }
      );
    }

    if (
      warehouseId !== null &&
      (!Number.isSafeInteger(warehouseId) || warehouseId <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Gudang tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!recipient || !purpose) {
      return NextResponse.json(
        {
          success: false,
          message: "Penerima dan tujuan penggunaan wajib diisi.",
        },
        { status: 400 }
      );
    }

    const transactionCode =
      "OUT-" +
      new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14) +
      "-" +
      Math.random().toString(36).slice(2, 7).toUpperCase();

    const result = await sql`
      WITH locked AS MATERIALIZED (
        SELECT
          id,
          stock,
          warehouse_id
        FROM spare_parts
        WHERE id = ${partId}
        FOR UPDATE
      ),
      updated AS (
        UPDATE spare_parts AS sp
        SET
          stock = sp.stock - ${quantity},
          updated_at = NOW()
        FROM locked AS l
        WHERE
          sp.id = l.id
          AND l.stock >= ${quantity}
        RETURNING
          sp.id,
          sp.code,
          sp.name,
          sp.stock,
          sp.warehouse_id
      ),
      inserted AS (
        INSERT INTO stock_out (
          transaction_code,
          part_id,
          warehouse_id,
          quantity,
          recipient,
          purpose
        )
        SELECT
          ${transactionCode},
          u.id,
          COALESCE(${warehouseId}::bigint, u.warehouse_id),
          ${quantity},
          ${recipient},
          ${purpose}
        FROM updated AS u
        RETURNING id, transaction_code, quantity, recipient, purpose
      ),
      movement AS (
        INSERT INTO stock_movements (
          part_id,
          warehouse_id,
          movement_type,
          quantity,
          reference_code,
          notes
        )
        SELECT
          u.id,
          COALESCE(${warehouseId}::bigint, u.warehouse_id),
          'OUT',
          ${quantity},
          ${transactionCode},
          ${"Penerima: " + recipient + " | Tujuan: " + purpose}
        FROM updated AS u
        RETURNING id
      )
      SELECT
        u.id AS part_id,
        u.code,
        u.name,
        u.stock AS current_stock,
        i.id AS transaction_id,
        i.transaction_code,
        i.quantity,
        i.recipient,
        i.purpose
      FROM updated AS u
      JOIN inserted AS i ON TRUE
    `;

    if (result.length === 0) {
      const existing = await sql`
        SELECT id, code, name, stock
        FROM spare_parts
        WHERE id = ${partId}
      `;

      if (existing.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Spare part tidak ditemukan.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Stok tidak mencukupi untuk transaksi ini.",
          data: {
            available_stock: Number(existing[0].stock),
            requested_quantity: quantity,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi stok keluar berhasil disimpan.",
        data: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST stock-out error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan transaksi stok keluar.",
      },
      { status: 500 }
    );
  }
}