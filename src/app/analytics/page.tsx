
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Package,
  TrendingUp,
  Warehouse,
} from "lucide-react";

const movementData = [
  { day: "03 Okt", masuk: 80, keluar: 40 },
  { day: "04 Okt", masuk: 60, keluar: 32 },
  { day: "05 Okt", masuk: 45, keluar: 18 },
  { day: "06 Okt", masuk: 68, keluar: 30 },
  { day: "07 Okt", masuk: 88, keluar: 45 },
  { day: "08 Okt", masuk: 72, keluar: 40 },
  { day: "09 Okt", masuk: 58, keluar: 32 },
];

const categories = [
  { name: "Bearing", stock: 399, color: "bg-blue-500" },
  { name: "V-Belt", stock: 250, color: "bg-emerald-500" },
  { name: "Bolt & Nut", stock: 225, color: "bg-orange-500" },
  { name: "Grease & Oil", stock: 150, color: "bg-violet-500" },
  { name: "Lainnya", stock: 224, color: "bg-slate-400" },
];

const lowStockItems = [
  { code: "SP-008", name: "Seal Kit", stock: 2, unit: "pcs" },
  { code: "SP-006", name: "Filter Oli", stock: 5, unit: "pcs" },
  { code: "SP-004", name: "Bolt M10", stock: 8, unit: "pcs" },
  { code: "SP-009", name: "Lampu LED", stock: 12, unit: "pcs" },
  { code: "SP-002", name: "V-Belt A42", stock: 15, unit: "pcs" },
];

const popularItems = [
  { code: "SP-001", name: "Bearing 6204", qty: 120 },
  { code: "SP-002", name: "V-Belt A42", qty: 85 },
  { code: "SP-003", name: "Grease Lubricant", qty: 65 },
  { code: "SP-004", name: "Bolt M10", qty: 52 },
  { code: "SP-005", name: "Nut M10", qty: 48 },
];

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7");

  const filteredMovement = useMemo(
    () => movementData.slice(-Number(period)),
    [period]
  );

  const totalStock = categories.reduce((sum, item) => sum + item.stock, 0);
  const totalIn = filteredMovement.reduce((sum, item) => sum + item.masuk, 0);
  const totalOut = filteredMovement.reduce((sum, item) => sum + item.keluar, 0);
  const estimatedValue = totalStock * 15000;
  const maxMovement = Math.max(
    ...filteredMovement.map((item) => Math.max(item.masuk, item.keluar)),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <BarChart3 size={17} className="text-blue-600" />
            Inventory / Analytics
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Analisis pergerakan stok dan kondisi persediaan spare part.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <CalendarDays size={18} className="text-slate-500" />
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
          >
            <option value="7">7 hari terakhir</option>
            <option value="3">3 hari terakhir</option>
            <option value="5">5 hari terakhir</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Stok"
          value={`${totalStock.toLocaleString("id-ID")} unit`}
          description="Akumulasi stok dari data demo"
          icon={<Package size={23} />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Barang Masuk"
          value={`${totalIn.toLocaleString("id-ID")} unit`}
          description="Total pergerakan masuk pada periode"
          icon={<ArrowDownToLine size={23} />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Barang Keluar"
          value={`${totalOut.toLocaleString("id-ID")} unit`}
          description="Total pergerakan keluar pada periode"
          icon={<ArrowUpFromLine size={23} />}
          color="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Estimasi Nilai Stok"
          value={`Rp ${estimatedValue.toLocaleString("id-ID")}`}
          description="Simulasi berdasarkan Rp15.000 per unit"
          icon={<CircleDollarSign size={23} />}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Pergerakan Stok"
          subtitle="Perbandingan jumlah barang masuk dan keluar."
          icon={<Activity size={21} />}
        >
          <div className="mb-4 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Barang masuk
            </span>
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Barang keluar
            </span>
          </div>

          <div className="space-y-5">
            {filteredMovement.map((item) => (
              <div key={item.day}>
                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>{item.day}</span>
                  <span>
                    Masuk {item.masuk} / Keluar {item.keluar}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${(item.masuk / maxMovement) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${(item.keluar / maxMovement) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Distribusi Kategori"
          subtitle="Jumlah stok berdasarkan kategori barang."
          icon={<Warehouse size={21} />}
        >
          <div className="space-y-5">
            {categories.map((category) => {
              const percentage = (category.stock / totalStock) * 100;

              return (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {category.name}
                    </span>
                    <span className="text-slate-500">
                      {category.stock} unit · {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${category.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total stok seluruh kategori</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalStock.toLocaleString("id-ID")} unit
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Stok Terendah"
          subtitle="Barang yang perlu diperiksa dan berpotensi perlu restock."
          icon={<AlertTriangle size={21} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Kode</th>
                  <th className="pb-3 pr-3 font-medium">Nama Barang</th>
                  <th className="pb-3 pr-3 font-medium">Stok</th>
                  <th className="pb-3 font-medium">Satuan</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr
                    key={item.code}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-3 font-medium text-slate-700">
                      {item.code}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{item.name}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.stock <= 5
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Catatan: daftar ini masih menggunakan data demo, bukan stok aktual.
          </p>
        </Panel>

        <Panel
          title="Barang Terlaris"
          subtitle="Barang dengan pergerakan keluar terbanyak pada data demo."
          icon={<TrendingUp size={21} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Kode</th>
                  <th className="pb-3 pr-3 font-medium">Nama Barang</th>
                  <th className="pb-3 text-right font-medium">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {popularItems.map((item) => (
                  <tr
                    key={item.code}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-3 font-medium text-slate-700">
                      {item.code}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{item.name}</td>
                    <td className="py-3 text-right font-semibold text-slate-700">
                      {item.qty} unit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Peringkat ini belum dihitung dari transaksi stok keluar aktual.
          </p>
        </Panel>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <BarChart3 size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Informasi Analytics</p>
          <p className="mt-1 leading-6">
            Halaman ini memakai data demo agar tampilan dan interaksi dapat
            diperiksa terlebih dahulu. Setelah semua fitur selesai, kita
            hubungkan analitik ke database Neon agar angka dihitung dari
            transaksi dan stok yang sebenarnya.
          </p>
        </div>
      </div>
    </div>
  );
}