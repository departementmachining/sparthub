
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const categoryId = searchParams.get("category_id");
    const warehouseId = searchParams.get("warehouse_id");

    const validDate = (value: string | null) =>
      value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (
      (from && !validDate(from)) ||
      (to && !validDate(to))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal harus YYYY-MM-DD.",
        },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal awal tidak boleh melewati tanggal akhir.",
        },
        { status: 400 }
      );
    }

    const parsedCategoryId =
      categoryId === null || categoryId === ""
        ? null
        : Number(categoryId);

    const parsedWarehouseId =
      warehouseId === null || warehouseId === ""
        ? null
        : Number(warehouseId);

    if (
      (parsedCategoryId !== null &&
        (!Number.isSafeInteger(parsedCategoryId) ||
          parsedCategoryId <= 0)) ||
      (parsedWarehouseId !== null &&
        (!Number.isSafeInteger(parsedWarehouseId) ||
          parsedWarehouseId <= 0))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Filter kategori atau gudang tidak valid.",
        },
        { status: 400 }
      );
    }

    const summary = await sql`
      SELECT
        COUNT(*)::int AS total_parts,
        COALESCE(SUM(stock), 0) AS total_stock,
        COALESCE(
          SUM(stock * purchase_price),
          0
        ) AS inventory_value,
        COUNT(*) FILTER (
          WHERE stock <= min_stock
        )::int AS low_stock_parts,
        COUNT(*) FILTER (
          WHERE stock = 0
        )::int AS out_of_stock_parts
      FROM spare_parts
      WHERE
        (${parsedCategoryId}::bigint IS NULL OR category_id = ${parsedCategoryId})
        AND (${parsedWarehouseId}::bigint IS NULL OR warehouse_id = ${parsedWarehouseId})
    `;

    const lowStock = await sql`
      SELECT
        sp.id,
        sp.code,
        sp.name,
        sp.unit,
        sp.stock,
        sp.min_stock,
        sp.purchase_price,
        c.name AS category,
        w.name AS warehouse
      FROM spare_parts sp
      LEFT JOIN categories c ON c.id = sp.category_id
      LEFT JOIN warehouses w ON w.id = sp.warehouse_id
      WHERE
        sp.stock <= sp.min_stock
        AND (${parsedCategoryId}::bigint IS NULL OR sp.category_id = ${parsedCategoryId})
        AND (${parsedWarehouseId}::bigint IS NULL OR sp.warehouse_id = ${parsedWarehouseId})
      ORDER BY sp.stock ASC, sp.name ASC
    `;

    const stockInSummary = await sql`
      SELECT
        COUNT(*)::int AS transaction_count,
        COALESCE(SUM(si.quantity), 0) AS total_quantity,
        COALESCE(SUM(si.quantity * si.unit_price), 0) AS total_value
      FROM stock_in si
      JOIN spare_parts sp ON sp.id = si.part_id
      WHERE
        (${from}::date IS NULL OR si.transaction_date >= ${from}::date)
        AND (${to}::date IS NULL OR si.transaction_date < (${to}::date + INTERVAL '1 day'))
        AND (${parsedCategoryId}::bigint IS NULL OR sp.category_id = ${parsedCategoryId})
        AND (${parsedWarehouseId}::bigint IS NULL OR COALESCE(si.warehouse_id, sp.warehouse_id) = ${parsedWarehouseId})
    `;

    const stockOutSummary = await sql`
      SELECT
        COUNT(*)::int AS transaction_count,
        COALESCE(SUM(so.quantity), 0) AS total_quantity
      FROM stock_out so
      JOIN spare_parts sp ON sp.id = so.part_id
      WHERE
        (${from}::date IS NULL OR so.transaction_date >= ${from}::date)
        AND (${to}::date IS NULL OR so.transaction_date < (${to}::date + INTERVAL '1 day'))
        AND (${parsedCategoryId}::bigint IS NULL OR sp.category_id = ${parsedCategoryId})
        AND (${parsedWarehouseId}::bigint IS NULL OR COALESCE(so.warehouse_id, sp.warehouse_id) = ${parsedWarehouseId})
    `;

    const movements = await sql`
      SELECT
        sm.id,
        sm.movement_type,
        sm.quantity,
        sm.reference_code,
        sm.notes,
        sm.created_at,
        sp.code AS part_code,
        sp.name AS part_name,
        w.name AS warehouse
      FROM stock_movements sm
      JOIN spare_parts sp ON sp.id = sm.part_id
      LEFT JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE
        (${from}::date IS NULL OR sm.created_at >= ${from}::date)
        AND (${to}::date IS NULL OR sm.created_at < (${to}::date + INTERVAL '1 day'))
        AND (${parsedCategoryId}::bigint IS NULL OR sp.category_id = ${parsedCategoryId})
        AND (${parsedWarehouseId}::bigint IS NULL OR COALESCE(sm.warehouse_id, sp.warehouse_id) = ${parsedWarehouseId})
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT 500
    `;

    return NextResponse.json({
      success: true,
      filters: {
        from,
        to,
        category_id: parsedCategoryId,
        warehouse_id: parsedWarehouseId,
      },
      data: {
        summary: summary[0],
        low_stock: lowStock,
        stock_in: stockInSummary[0],
        stock_out: stockOutSummary[0],
        movements,
      },
    });
  } catch (error) {
    console.error("GET reports error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil laporan inventory.",
      },
      { status: 500 }
    );
  }
}