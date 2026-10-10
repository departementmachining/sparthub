
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  Download,
  FileBarChart,
  Package,
  Search,
  TrendingUp,
} from "lucide-react";

type Transaction = {
  id: number;
  date: string;
  reference: string;
  code: string;
  name: string;
  type: "Masuk" | "Keluar";
  quantity: number;
  unit: string;
  warehouse: string;
  description: string;
};

const demoTransactions: Transaction[] = [
  {
    id: 1,
    date: "2026-10-09",
    reference: "IN-20261009-001",
    code: "SP-001",
    name: "Bearing 6204",
    type: "Masuk",
    quantity: 10,
    unit: "pcs",
    warehouse: "Gudang Utama",
    description: "Pembelian",
  },
  {
    id: 2,
    date: "2026-10-09",
    reference: "OUT-20261009-001",
    code: "SP-002",
    name: "V-Belt A42",
    type: "Keluar",
    quantity: 2,
    unit: "pcs",
    warehouse: "Gudang Utama",
    description: "Perbaikan Mesin",
  },
  {
    id: 3,
    date: "2026-10-08",
    reference: "IN-20261008-001",
    code: "SP-003",
    name: "Grease Lubricant",
    type: "Masuk",
    quantity: 15,
    unit: "tube",
    warehouse: "Gudang Maintenance",
    description: "Pembelian",
  },
  {
    id: 4,
    date: "2026-10-08",
    reference: "OUT-20261008-001",
    code: "SP-004",
    name: "Bolt M10",
    type: "Keluar",
    quantity: 20,
    unit: "pcs",
    warehouse: "Gudang Maintenance",
    description: "Pemakaian Produksi",
  },
  {
    id: 5,
    date: "2026-10-07",
    reference: "IN-20261007-001",
    code: "SP-001",
    name: "Bearing 6204",
    type: "Masuk",
    quantity: 5,
    unit: "pcs",
    warehouse: "Gudang Utama",
    description: "Retur",
  },
  {
    id: 6,
    date: "2026-10-06",
    reference: "OUT-20261006-001",
    code: "SP-003",
    name: "Grease Lubricant",
    type: "Keluar",
    quantity: 3,
    unit: "tube",
    warehouse: "Gudang Maintenance",
    description: "Perbaikan Mesin",
  },
];

const numberFormat = (value: number) =>
  value.toLocaleString("id-ID");

export default function ReportsPage() {
  const [transactions] = useState<Transaction[]>(demoTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return transactions.filter((item) => {
      const matchesSearch = [
        item.reference,
        item.code,
        item.name,
        item.warehouse,
        item.description,
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesType =
        typeFilter === "Semua" || item.type === typeFilter;

      const matchesStart = !startDate || item.date >= startDate;
      const matchesEnd = !endDate || item.date <= endDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [transactions, search, typeFilter, startDate, endDate]);

  const totalIn = filteredTransactions
    .filter((item) => item.type === "Masuk")
    .reduce((sum, item) => sum + item.quantity, 0);

  const totalOut = filteredTransactions
    .filter((item) => item.type === "Keluar")
    .reduce((sum, item) => sum + item.quantity, 0);

  const uniqueParts = new Set(
    filteredTransactions.map((item) => item.code)
  ).size;

  const exportCsv = () => {
    const headers = [
      "Tanggal",
      "Referensi",
      "Kode Barang",
      "Nama Barang",
      "Jenis Transaksi",
      "Jumlah",
      "Satuan",
      "Gudang",
      "Keterangan",
    ];

    const rows = filteredTransactions.map((item) => [
      item.date,
      item.reference,
      item.code,
      item.name,
      item.type,
      item.quantity,
      item.unit,
      item.warehouse,
      item.description,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-inventory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("Semua");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <FileBarChart size={16} />
            Inventory / Reports
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laporan Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau pergerakan stok dan unduh laporan transaksi.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={filteredTransactions.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Transaksi"
          value={numberFormat(filteredTransactions.length)}
          description="Transaksi sesuai filter"
          icon={<FileBarChart size={21} />}
          iconClass="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          title="Total Barang Masuk"
          value={numberFormat(totalIn)}
          description="Jumlah unit yang masuk"
          icon={<ArrowDownToLine size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          title="Total Barang Keluar"
          value={numberFormat(totalOut)}
          description="Jumlah unit yang keluar"
          icon={<ArrowUpFromLine size={21} />}
          iconClass="bg-rose-50 text-rose-600"
        />
        <SummaryCard
          title="Jenis Spare Part"
          value={numberFormat(uniqueParts)}
          description="Kode barang dalam laporan"
          icon={<Package size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={19} className="text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">Filter Laporan</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tentukan periode dan jenis transaksi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Tanggal Mulai">
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FilterField>

          <FilterField label="Tanggal Akhir">
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FilterField>

          <FilterField label="Jenis Transaksi">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Transaksi</option>
              <option value="Masuk">Barang Masuk</option>
              <option value="Keluar">Barang Keluar</option>
            </select>
          </FilterField>

          <FilterField label="Cari Barang">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kode, nama, referensi..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </FilterField>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Detail Transaksi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Data mengikuti tanggal dan filter yang dipilih.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-medium text-emerald-700">
              Ringkasan Barang Masuk
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-800">
              +{numberFormat(totalIn)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4">
            <p className="text-xs font-medium text-rose-700">
              Ringkasan Barang Keluar
            </p>
            <p className="mt-1 text-xl font-bold text-rose-800">
              -{numberFormat(totalOut)}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700">
              Selisih Pergerakan Unit
            </p>
            <p className="mt-1 text-xl font-bold text-blue-800">
              {totalIn - totalOut > 0 ? "+" : ""}
              {numberFormat(totalIn - totalOut)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Referensi</th>
                <th className="px-4 py-3 font-semibold">Barang</th>
                <th className="px-4 py-3 font-semibold">Gudang</th>
                <th className="px-4 py-3 font-semibold">Jenis</th>
                <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {item.date}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-blue-700">
                    {item.reference}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.code}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {item.warehouse}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.type === "Masuk"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                    <span
                      className={
                        item.type === "Masuk"
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }
                    >
                      {item.type === "Masuk" ? "+" : "-"}
                      {numberFormat(item.quantity)}
                    </span>{" "}
                    <span className="font-normal text-slate-500">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.description}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FileBarChart
                      size={30}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 font-semibold text-slate-700">
                      Data tidak ditemukan
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ubah periode atau filter untuk melihat transaksi.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Menampilkan {filteredTransactions.length} dari {transactions.length}{" "}
          transaksi contoh.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <TrendingUp size={20} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Informasi laporan
          </p>
          <p className="mt-1 text-sm text-blue-800">
            Selisih di halaman ini adalah selisih jumlah unit transaksi
            masuk dan keluar, bukan nilai stok akhir seluruh gudang.
            Data akan diambil dari transaksi aktual setelah database
            diintegrasikan.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}