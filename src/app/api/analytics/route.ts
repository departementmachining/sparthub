
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const periodParam = Number(searchParams.get("days") ?? 30);
    const days = Number.isFinite(periodParam)
      ? Math.min(365, Math.max(1, Math.floor(periodParam)))
      : 30;

    const trend = await sql`
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - (${days}::int - 1),
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      ),
      stock_in_daily AS (
        SELECT
          transaction_date::date AS day,
          SUM(quantity) AS quantity
        FROM stock_in
        WHERE transaction_date >= CURRENT_DATE - (${days}::int - 1)
          AND transaction_date < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY transaction_date::date
      ),
      stock_out_daily AS (
        SELECT
          transaction_date::date AS day,
          SUM(quantity) AS quantity
        FROM stock_out
        WHERE transaction_date >= CURRENT_DATE - (${days}::int - 1)
          AND transaction_date < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY transaction_date::date
      )
      SELECT
        ds.day,
        COALESCE(si.quantity, 0) AS stock_in,
        COALESCE(so.quantity, 0) AS stock_out
      FROM date_series ds
      LEFT JOIN stock_in_daily si ON si.day = ds.day
      LEFT JOIN stock_out_daily so ON so.day = ds.day
      ORDER BY ds.day ASC
    `;

    const stockSummary = await sql`
      SELECT
        COUNT(*)::int AS total_parts,
        COALESCE(SUM(stock), 0) AS total_stock,
        COUNT(*) FILTER (
          WHERE stock <= min_stock
        )::int AS low_stock_parts,
        COUNT(*) FILTER (
          WHERE stock = 0
        )::int AS out_of_stock_parts,
        COALESCE(
          SUM(stock * purchase_price),
          0
        ) AS inventory_value
      FROM spare_parts
    `;

    const movementSummary = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE movement_type = 'IN'
        )::int AS stock_in_transactions,
        COUNT(*) FILTER (
          WHERE movement_type = 'OUT'
        )::int AS stock_out_transactions,
        COUNT(*) FILTER (
          WHERE movement_type = 'ADJUSTMENT'
        )::int AS adjustment_transactions
      FROM stock_movements
      WHERE created_at >= CURRENT_DATE - (${days}::int - 1)
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `;

    const topMovingParts = await sql`
      SELECT
        sp.id,
        sp.code,
        sp.name,
        sp.unit,
        COUNT(sm.id)::int AS movement_count,
        COALESCE(SUM(sm.quantity), 0) AS total_moved
      FROM spare_parts sp
      JOIN stock_movements sm ON sm.part_id = sp.id
      WHERE sm.created_at >= CURRENT_DATE - (${days}::int - 1)
        AND sm.created_at < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY sp.id, sp.code, sp.name, sp.unit
      ORDER BY total_moved DESC, movement_count DESC
      LIMIT 10
    `;

    const movementTypes = await sql`
      SELECT
        movement_type,
        COUNT(*)::int AS transaction_count,
        COALESCE(SUM(quantity), 0) AS total_quantity
      FROM stock_movements
      WHERE created_at >= CURRENT_DATE - (${days}::int - 1)
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY movement_type
      ORDER BY movement_type
    `;

    return NextResponse.json({
      success: true,
      filters: { days },
      data: {
        stock_summary: stockSummary[0],
        movement_summary: movementSummary[0],
        daily_trend: trend,
        top_moving_parts: topMovingParts,
        movement_types: movementTypes,
      },
    });
  } catch (error) {
    console.error("GET analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data analytics inventory.",
      },
      { status: 500 }
    );
  }
}