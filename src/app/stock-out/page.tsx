"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowUpFromLine,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";

type Part = {
  id: number;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  stock: number;
  unit: string;
};

type StockOutTransaction = {
  id: number;
  reference: string;
  date: string;
  partId: number;
  partCode: string;
  partName: string;
  warehouse: string;
  quantity: number;
  unit: string;
  purpose: string;
  recipient: string;
  note: string;
};

const initialParts: Part[] = [
  {
    id: 1,
    code: "SP-001",
    name: "Bearing 6204",
    category: "Bearing",
    warehouse: "Gudang Utama",
    stock: 25,
    unit: "pcs",
  },
  {
    id: 2,
    code: "SP-002",
    name: "V-Belt A42",
    category: "Belt",
    warehouse: "Gudang Utama",
    stock: 12,
    unit: "pcs",
  },
  {
    id: 3,
    code: "SP-003",
    name: "Grease Lubricant",
    category: "Lubricant",
    warehouse: "Gudang Maintenance",
    stock: 8,
    unit: "tube",
  },
  {
    id: 4,
    code: "SP-004",
    name: "Bolt M10",
    category: "Fastener",
    warehouse: "Gudang Maintenance",
    stock: 100,
    unit: "pcs",
  },
];

const initialTransactions: StockOutTransaction[] = [
  {
    id: 1,
    reference: "OUT-20261009-001",
    date: "2026-10-09",
    partId: 2,
    partCode: "SP-002",
    partName: "V-Belt A42",
    warehouse: "Gudang Utama",
    quantity: 2,
    unit: "pcs",
    purpose: "Perbaikan Mesin",
    recipient: "Tim Maintenance",
    note: "Penggantian belt mesin produksi",
  },
  {
    id: 2,
    reference: "OUT-20261009-002",
    date: "2026-10-09",
    partId: 4,
    partCode: "SP-004",
    partName: "Bolt M10",
    warehouse: "Gudang Maintenance",
    quantity: 10,
    unit: "pcs",
    purpose: "Pemakaian Produksi",
    recipient: "Line Produksi 1",
    note: "Kebutuhan perakitan",
  },
];

// Gunakan hanya di effect dan event handler,
// jangan panggil ketika komponen dirender.
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function StockOutPage() {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [transactions, setTransactions] =
    useState<StockOutTransaction[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("Semua");
  const [showForm, setShowForm] = useState(false);

  const [partId, setPartId] = useState("");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [purpose, setPurpose] = useState("Perbaikan Mesin");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Isi tanggal setelah halaman dipasang di browser.
  useEffect(() => {
    setDate(getTodayDate());
  }, []);

  const selectedPart = parts.find(
    (part) => part.id === Number(partId)
  );

  const requestedQuantity = Number(quantity);

  const isQuantityValid =
    Number.isInteger(requestedQuantity) &&
    requestedQuantity > 0;

  const hasEnoughStock =
    !!selectedPart &&
    isQuantityValid &&
    requestedQuantity <= selectedPart.stock;

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.reference.toLowerCase().includes(keyword) ||
        transaction.partCode.toLowerCase().includes(keyword) ||
        transaction.partName.toLowerCase().includes(keyword) ||
        transaction.warehouse.toLowerCase().includes(keyword) ||
        transaction.recipient.toLowerCase().includes(keyword);

      const matchesPurpose =
        purposeFilter === "Semua" ||
        transaction.purpose === purposeFilter;

      return matchesSearch && matchesPurpose;
    });
  }, [transactions, search, purposeFilter]);

  const totalQuantity = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0
      ),
    [transactions]
  );

  const todayTransactions = useMemo(() => {
    if (!date) return 0;

    return transactions.filter(
      (transaction) => transaction.date === date
    ).length;
  }, [transactions, date]);

  const resetForm = () => {
    setPartId("");
    setDate(getTodayDate());
    setQuantity("1");
    setPurpose("Perbaikan Mesin");
    setRecipient("");
    setNote("");
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const part = parts.find(
      (item) => item.id === Number(partId)
    );

    const qty = Number(quantity);

    if (!part) {
      setError("Pilih spare part terlebih dahulu.");
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      setError(
        "Jumlah keluar harus berupa bilangan bulat lebih dari 0."
      );
      return;
    }

    if (qty > part.stock) {
      setError(
        `Stok tidak mencukupi. Stok tersedia hanya ${part.stock} ${part.unit}.`
      );
      return;
    }

    if (!date) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    if (!recipient.trim()) {
      setError(
        "Nama penerima atau bagian pemakai wajib diisi."
      );
      return;
    }

    const nextNumber =
      transactions.reduce((max, transaction) => {
        const match = transaction.reference.match(/-(\d+)$/);
        const number = match ? Number(match[1]) : 0;

        return Math.max(max, number);
      }, 0) + 1;

    const reference = `OUT-${date.replaceAll("-", "")}-${String(
      nextNumber
    ).padStart(3, "0")}`;

    const newTransaction: StockOutTransaction = {
      id: Date.now(),
      reference,
      date,
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      warehouse: part.warehouse,
      quantity: qty,
      unit: part.unit,
      purpose,
      recipient: recipient.trim(),
      note: note.trim(),
    };

    setParts((currentParts) =>
      currentParts.map((item) =>
        item.id === part.id
          ? { ...item, stock: item.stock - qty }
          : item
      )
    );

    setTransactions((current) => [
      newTransaction,
      ...current,
    ]);

    setShowForm(false);
    resetForm();
  };

  const exportCsv = () => {
    const headers = [
      "Referensi",
      "Tanggal",
      "Kode Barang",
      "Nama Barang",
      "Gudang",
      "Jumlah",
      "Satuan",
      "Keperluan",
      "Penerima",
      "Catatan",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.reference,
      transaction.date,
      transaction.partCode,
      transaction.partName,
      transaction.warehouse,
      String(transaction.quantity),
      transaction.unit,
      transaction.purpose,
      transaction.recipient,
      transaction.note,
    ]);

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `barang-keluar-${getTodayDate()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Package size={16} />
            Inventory
            <span>/</span>
            <span className="text-slate-700">Stock Out</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Barang Keluar
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Catat pemakaian spare part dan pantau pengurangan stok.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Barang Keluar
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Transaksi"
          value={transactions.length.toLocaleString("id-ID")}
          description="Seluruh transaksi keluar"
          icon={<ClipboardList size={21} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Total Barang Keluar"
          value={totalQuantity.toLocaleString("id-ID")}
          description="Akumulasi jumlah barang"
          icon={<ArrowUpFromLine size={21} />}
          iconClass="bg-rose-50 text-rose-600"
        />

        <SummaryCard
          title="Transaksi Hari Ini"
          value={todayTransactions.toLocaleString("id-ID")}
          description="Berdasarkan tanggal transaksi"
          icon={<CalendarDays size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <SummaryCard
          title="Jenis Spare Part"
          value={parts.length.toLocaleString("id-ID")}
          description="Barang tersedia pada demo"
          icon={<Package size={21} />}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Riwayat transaksi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Riwayat Barang Keluar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daftar pemakaian dan pengeluaran spare part.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari transaksi atau barang..."
                aria-label="Cari transaksi atau barang"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={purposeFilter}
              onChange={(event) =>
                setPurposeFilter(event.target.value)
              }
              aria-label="Filter keperluan"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Keperluan</option>
              <option value="Perbaikan Mesin">Perbaikan Mesin</option>
              <option value="Pemakaian Produksi">
                Pemakaian Produksi
              </option>
              <option value="Transfer Gudang">Transfer Gudang</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowUpFromLine size={17} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Referensi</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Barang</th>
                <th className="px-4 py-3 font-semibold">Gudang</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Jumlah
                </th>
                <th className="px-4 py-3 font-semibold">Keperluan</th>
                <th className="px-4 py-3 font-semibold">Penerima</th>
                <th className="px-4 py-3 font-semibold">Catatan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="font-semibold text-blue-700">
                      {transaction.reference}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {transaction.date}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">
                      {transaction.partName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.partCode}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {transaction.warehouse}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <span className="font-bold text-rose-600">
                      -{transaction.quantity}
                    </span>{" "}
                    <span className="text-slate-500">
                      {transaction.unit}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {transaction.purpose}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {transaction.recipient}
                  </td>

                  <td className="max-w-[180px] px-4 py-4 text-slate-500">
                    {transaction.note || "-"}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search size={28} />
                      <p className="font-medium text-slate-600">
                        Transaksi tidak ditemukan
                      </p>
                      <p className="text-xs">
                        Coba ubah kata kunci atau filter keperluan.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Menampilkan {filteredTransactions.length} dari{" "}
          {transactions.length} transaksi.
        </div>
      </div>

      {/* Form tambah barang keluar */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
              resetForm();
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tambah Barang Keluar
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi data pengeluaran spare part.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Tutup formulir"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Pilih Barang" required>
                  <select
                    value={partId}
                    onChange={(event) =>
                      setPartId(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Pilih spare part</option>

                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.code} - {part.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Tanggal Keluar" required>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </FormField>

                <FormField label="Jumlah Keluar" required>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </FormField>

                <FormField label="Keperluan" required>
                  <select
                    value={purpose}
                    onChange={(event) =>
                      setPurpose(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Perbaikan Mesin">
                      Perbaikan Mesin
                    </option>
                    <option value="Pemakaian Produksi">
                      Pemakaian Produksi
                    </option>
                    <option value="Transfer Gudang">
                      Transfer Gudang
                    </option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </FormField>

                <div className="sm:col-span-2">
                  <FormField
                    label="Penerima / Bagian Pemakai"
                    required
                  >
                    <input
                      value={recipient}
                      onChange={(event) =>
                        setRecipient(event.target.value)
                      }
                      required
                      placeholder="Contoh: Tim Maintenance / Line Produksi 1"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Catatan">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Alasan atau detail pemakaian barang..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </FormField>
                </div>
              </div>

              {selectedPart && (
                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    hasEnoughStock
                      ? "border-blue-100 bg-blue-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  {hasEnoughStock ? (
                    <Package
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                  ) : (
                    <AlertTriangle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                  )}

                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">
                      Informasi stok
                    </p>

                    <p className="mt-1 text-slate-700">
                      Stok tersedia:{" "}
                      <strong>{selectedPart.stock}</strong>{" "}
                      {selectedPart.unit}
                    </p>

                    {isQuantityValid && (
                      <p className="mt-1 text-slate-700">
                        Perkiraan sisa stok:{" "}
                        <strong>
                          {selectedPart.stock - requestedQuantity}
                        </strong>{" "}
                        {selectedPart.unit}
                      </p>
                    )}

                    {!hasEnoughStock && isQuantityValid && (
                      <p className="mt-1 text-amber-700">
                        Jumlah keluar melebihi stok yang tersedia.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <CheckCircle2 size={18} />
                  Simpan Barang Keluar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}