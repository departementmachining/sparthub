
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  Package,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Summary = {
  total_parts: number | string;
  total_stock: number | string;
  inventory_value: number | string;
  low_stock_parts: number | string;
  out_of_stock_parts: number | string;
};

type Trend = {
  day: string;
  stock_in: number | string;
  stock_out: number | string;
};

type LowStockPart = {
  id: number;
  code: string;
  name: string;
  category: string | null;
  stock: number | string;
  min_stock: number | string;
  unit: string;
};

type Movement = {
  id: number;
  movement_type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number | string;
  reference_code: string | null;
  notes: string | null;
  created_at: string;
  part_code: string;
  part_name: string;
  warehouse: string | null;
};

type DashboardData = {
  summary: Summary;
  trend: Trend[];
  lowStock: LowStockPart[];
  movements: Movement[];
};

const numberFormat = new Intl.NumberFormat("id-ID");

function formatNumber(value: number | string | null | undefined) {
  return numberFormat.format(Number(value ?? 0));
}

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [analyticsResponse, reportsResponse] = await Promise.all([
          fetch("/api/analytics?days=30", { cache: "no-store" }),
          fetch("/api/reports", { cache: "no-store" }),
        ]);

        const [analytics, reports] = await Promise.all([
          analyticsResponse.json(),
          reportsResponse.json(),
        ]);

        if (!analyticsResponse.ok || !analytics.success) {
          throw new Error(
            analytics.message ?? "Gagal mengambil data analytics."
          );
        }

        if (!reportsResponse.ok || !reports.success) {
          throw new Error(
            reports.message ?? "Gagal mengambil data laporan."
          );
        }

        if (!active) return;

        setData({
          summary: analytics.data.stock_summary,
          trend: analytics.data.daily_trend,
          lowStock: reports.data.low_stock,
          movements: reports.data.movements,
        });
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat Dashboard."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const summary = data?.summary;

  const totalParts = Number(summary?.total_parts ?? 0);
  const totalStock = Number(summary?.total_stock ?? 0);
  const inventoryValue = Number(summary?.inventory_value ?? 0);
  const lowStockCount = Number(summary?.low_stock_parts ?? 0);
  const outOfStockCount = Number(summary?.out_of_stock_parts ?? 0);
  const healthyCount = Math.max(
    0,
    totalParts - lowStockCount
  );
  const lowOnlyCount = Math.max(
    0,
    lowStockCount - outOfStockCount
  );
  const healthyPercent =
    totalParts > 0
      ? Math.round((healthyCount / totalParts) * 100)
      : 0;
  const lowPercent =
    totalParts > 0
      ? (lowOnlyCount / totalParts) * 100
      : 0;
  const outPercent =
    totalParts > 0
      ? (outOfStockCount / totalParts) * 100
      : 0;

  const healthGradient = `conic-gradient(#16a34a 0% ${healthyPercent}%, #f59e0b ${healthyPercent}% ${healthyPercent + lowPercent}%, #ef4444 ${healthyPercent + lowPercent}% ${healthyPercent + lowPercent + outPercent}%, #e2e8f0 ${healthyPercent + lowPercent + outPercent}% 100%)`;

  const stats = [
    {
      label: "Total Spare Parts",
      value: formatNumber(totalParts),
      note: "Jenis barang terdaftar",
      icon: Package,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Stock Units",
      value: formatNumber(totalStock),
      note: "Akumulasi kuantitas stok",
      icon: Boxes,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      label: "Low Stock Items",
      value: formatNumber(lowStockCount),
      note: `${formatNumber(outOfStockCount)} barang stok habis`,
      icon: CircleAlert,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(inventoryValue),
      note: "Berdasarkan harga beli",
      icon: TrendingUp,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Warehouse size={16} />
            <span>Overview</span>
            <span>/</span>
            <span className="text-slate-800">Dashboard</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Inventory Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ringkasan kondisi inventory berdasarkan data database.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh Data
        </button>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Dashboard gagal dimuat</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs">
            Periksa endpoint Analytics dan Reports.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950">
                    {loading ? "Memuat..." : stat.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                  <Icon size={21} strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                {stat.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <SectionTitle
              title="Stock Movement"
              description="Tren stok masuk dan keluar selama 30 hari"
            />

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Stock In
              </span>

              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                Stock Out
              </span>
            </div>
          </div>

          <div className="mt-6 h-[280px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Memuat grafik...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(data?.trend ?? []).map((item) => ({
                    day: formatDate(item.day),
                    incoming: Number(item.stock_in),
                    outgoing: Number(item.stock_out),
                  }))}
                  margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="stockInGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="stockOutGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#eef2f7"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickMargin={12}
                    minTickGap={20}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="incoming"
                    name="Stock In"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#stockInGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="outgoing"
                    name="Stock Out"
                    stroke="#a78bfa"
                    strokeWidth={2.5}
                    fill="url(#stockOutGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Sumber: transaksi stok di database Neon.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <SectionTitle
              title="Stock Health"
              description="Kondisi jenis barang saat ini"
            />

            <span className="whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {loading ? "..." : `${healthyPercent}% sehat`}
            </span>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{ background: healthGradient }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-900">
                  {loading ? "..." : `${healthyPercent}%`}
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Stock health
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {[
              {
                label: "Healthy stock",
                count: healthyCount,
                color: "bg-emerald-500",
              },
              {
                label: "Low stock",
                count: lowOnlyCount,
                color: "bg-amber-500",
              },
              {
                label: "Out of stock",
                count: outOfStockCount,
                color: "bg-red-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {loading ? "..." : formatNumber(item.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3 p-6">
            <SectionTitle
              title="Low Stock Alerts"
              description="Barang yang perlu diperiksa atau diisi ulang"
            />

            <Link
              href="/spare-parts"
              className="whitespace-nowrap text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Spare Part
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && (data?.lowStock.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      Tidak ada barang dengan stok minimum.
                    </td>
                  </tr>
                )}

                {loading &&
                  [1, 2, 3].map((item) => (
                    <tr key={item} className="border-b border-slate-100">
                      <td colSpan={4} className="px-6 py-4 text-sm text-slate-400">
                        Memuat data barang...
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  data?.lowStock.slice(0, 5).map((part) => {
                    const stock = Number(part.stock);
                    const minimum = Number(part.min_stock);
                    const critical = stock === 0;

                    return (
                      <tr
                        key={part.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <Package size={19} />
                            </div>

                            <div>
                              <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
                                {part.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {part.code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {part.category || "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatNumber(stock)} {part.unit}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Min: {formatNumber(minimum)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                              critical
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {critical ? "Out of Stock" : "Low Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Recent Activity"
            description="Pergerakan stok terbaru"
          />

          <div className="mt-6 space-y-5">
            {!loading && (data?.movements.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                Belum ada aktivitas inventory.
              </p>
            )}

            {loading && (
              <p className="py-8 text-center text-sm text-slate-400">
                Memuat aktivitas...
              </p>
            )}

            {!loading &&
              data?.movements.slice(0, 5).map((movement, index) => {
                const isIn = movement.movement_type === "IN";
                const isOut = movement.movement_type === "OUT";

                const title = isIn
                  ? "Stock received"
                  : isOut
                    ? "Stock issued"
                    : "Inventory adjustment";

                const Icon = isIn
                  ? PackageCheck
                  : isOut
                    ? ShoppingCart
                    : Activity;

                const iconStyle = isIn
                  ? "bg-emerald-50 text-emerald-600"
                  : isOut
                    ? "bg-blue-50 text-blue-600"
                    : "bg-violet-50 text-violet-600";

                return (
                  <div key={movement.id} className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {title}
                        </p>

                        <span className="text-[11px] text-slate-400">
                          {formatTime(movement.created_at)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {movement.reference_code || "Tanpa nomor referensi"}
                        {" · "}
                        {movement.part_name}
                        {" · "}
                        {formatNumber(movement.quantity)} unit
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {movement.part_code}
                        {movement.warehouse
                          ? ` · ${movement.warehouse}`
                          : ""}
                        {" · "}
                        {formatDate(movement.created_at)}
                      </p>

                      {index < Math.min(data.movements.length, 5) - 1 && (
                        <div className="mt-4 border-b border-slate-100" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <Link
            href="/reports"
            className="mt-6 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            View activity log
          </Link>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
        <span>© 2026 SpareHub Inventory Management</span>

        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              error ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          {error ? "Data connection error" : "Inventory dashboard"}
        </span>
      </footer>
    </div>
  );
}
