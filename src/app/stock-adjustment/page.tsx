"use client";

import { useMemo, useState } from "react";
import {
ClipboardList,
Search,
Plus,
X,
ArrowDownToLine,
ArrowUpFromLine,
History,
} from "lucide-react";

type SparePart = {
id: number;
code: string;
name: string;
stock: number;
};

type Adjustment = {
id: number;
date: string;
partId: number;
code: string;
name: string;
type: "Penambahan" | "Pengurangan";
quantity: number;
before: number;
after: number;
reason: string;
note: string;
};

const initialParts: SparePart[] = [
{ id: 1, code: "BRG-001", name: "Bearing 6204", stock: 25 },
{ id: 2, code: "ELC-001", name: "Proximity Sensor", stock: 12 },
{ id: 3, code: "MEC-001", name: "V-Belt A42", stock: 18 },
{ id: 4, code: "HYD-001", name: "Hydraulic Seal", stock: 30 },
{ id: 5, code: "PNE-001", name: "Solenoid Valve", stock: 8 },
];

const initialAdjustments: Adjustment[] = [];

const reasons = [
"Stock Opname",
"Barang Rusak",
"Koreksi Stok",
"Barang Hilang",
"Barang Ditemukan",
"Lainnya",
];

export default function StockAdjustmentPage() {
const [parts, setParts] = useState(initialParts);
const [adjustments, setAdjustments] = useState(initialAdjustments);
const [search, setSearch] = useState("");
const [typeFilter, setTypeFilter] = useState("Semua");
const [showForm, setShowForm] = useState(false);

const [partId, setPartId] = useState("");
const [type, setType] = useState<"Penambahan" | "Pengurangan">(
"Penambahan"
);
const [quantity, setQuantity] = useState("1");
const [reason, setReason] = useState("Stock Opname");
const [note, setNote] = useState("");
const [error, setError] = useState("");

const selectedPart = parts.find(
(part) => part.id === Number(partId)
);

const adjustmentQuantity = Number(quantity) || 0;

const projectedStock = selectedPart
? selectedPart.stock +
(type === "Penambahan" ? adjustmentQuantity : -adjustmentQuantity)
: 0;

const filteredAdjustments = useMemo(() => {
const keyword = search.toLowerCase().trim();

return adjustments.filter((item) => {
  const matchesSearch = [
    item.code,
    item.name,
    item.reason,
    item.note,
  ].some((value) => value.toLowerCase().includes(keyword));

  const matchesType =
    typeFilter === "Semua" || item.type === typeFilter;

  return matchesSearch && matchesType;
});

}, [adjustments, search, typeFilter]);

const totalAdded = adjustments
.filter((item) => item.type === "Penambahan")
.reduce((sum, item) => sum + item.quantity, 0);

const totalReduced = adjustments
.filter((item) => item.type === "Pengurangan")
.reduce((sum, item) => sum + item.quantity, 0);

function openForm() {
setPartId("");
setType("Penambahan");
setQuantity("1");
setReason("Stock Opname");
setNote("");
setError("");
setShowForm(true);
}

function saveAdjustment(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

if (!selectedPart) {
  setError("Pilih spare part terlebih dahulu.");
  return;
}

if (!Number.isInteger(adjustmentQuantity) || adjustmentQuantity <= 0) {
  setError("Jumlah penyesuaian harus berupa bilangan bulat lebih dari 0.");
  return;
}

if (type === "Pengurangan" && adjustmentQuantity > selectedPart.stock) {
  setError("Stok tidak mencukupi untuk pengurangan ini.");
  return;
}

const before = selectedPart.stock;
const after =
  before +
  (type === "Penambahan" ? adjustmentQuantity : -adjustmentQuantity);

const newAdjustment: Adjustment = {
  id: Math.max(0, ...adjustments.map((item) => item.id)) + 1,
  date: new Date().toLocaleString("id-ID"),
  partId: selectedPart.id,
  code: selectedPart.code,
  name: selectedPart.name,
  type,
  quantity: adjustmentQuantity,
  before,
  after,
  reason,
  note: note.trim(),
};

setParts((current) =>
  current.map((part) =>
    part.id === selectedPart.id ? { ...part, stock: after } : part
  )
);

setAdjustments((current) => [newAdjustment, ...current]);
setShowForm(false);
setError("");

}

return ( <div className="min-h-screen space-y-6 bg-slate-50 p-6 text-slate-800"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <div className="flex items-center gap-2 text-sm text-slate-500"> <ClipboardList size={16} /> <span>Inventory</span> <span>/</span> <span>Stock Adjustment</span> </div> <h1 className="mt-2 text-3xl font-bold tracking-tight">
Stock Adjustment </h1> <p className="mt-1 text-sm text-slate-500">
Koreksi jumlah stok berdasarkan kondisi aktual di gudang. </p> </div>

    <button
      onClick={openForm}
      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
    >
      <Plus size={18} />
      Penyesuaian Baru
    </button>
  </div>

  <div className="grid gap-4 sm:grid-cols-3">
    <SummaryCard
      title="Total Penyesuaian"
      value={adjustments.length}
      description="Jumlah transaksi koreksi"
      icon={<History size={22} />}
      color="blue"
    />
    <SummaryCard
      title="Total Penambahan"
      value={totalAdded}
      description="Unit ditambahkan"
      icon={<ArrowDownToLine size={22} />}
      color="emerald"
    />
    <SummaryCard
      title="Total Pengurangan"
      value={totalReduced}
      description="Unit dikurangi"
      icon={<ArrowUpFromLine size={22} />}
      color="rose"
    />
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <ClipboardList size={19} className="text-blue-600" />
      <h2 className="font-semibold">Stok Saat Ini</h2>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Kode</th>
            <th className="px-4 py-3">Nama Spare Part</th>
            <th className="px-4 py-3 text-right">Stok</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parts.map((part) => (
            <tr key={part.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-blue-600">
                {part.code}
              </td>
              <td className="px-4 py-3 font-medium">{part.name}</td>
              <td className="px-4 py-3 text-right font-semibold">
                {part.stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
      <div>
        <h2 className="font-semibold">Riwayat Penyesuaian</h2>
        <p className="mt-1 text-xs text-slate-500">
          Daftar koreksi stok yang dicatat pada halaman ini.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari transaksi..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-56"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="Semua">Semua Jenis</option>
          <option value="Penambahan">Penambahan</option>
          <option value="Pengurangan">Pengurangan</option>
        </select>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4">Tanggal</th>
            <th className="px-5 py-4">Spare Part</th>
            <th className="px-5 py-4">Jenis</th>
            <th className="px-5 py-4 text-right">Sebelum</th>
            <th className="px-5 py-4 text-right">Perubahan</th>
            <th className="px-5 py-4 text-right">Sesudah</th>
            <th className="px-5 py-4">Alasan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredAdjustments.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                {item.date}
              </td>
              <td className="px-5 py-4">
                <div className="font-mono text-xs text-blue-600">
                  {item.code}
                </div>
                <div className="mt-1 font-medium">{item.name}</div>
                {item.note && (
                  <div className="mt-1 max-w-48 truncate text-xs text-slate-500">
                    {item.note}
                  </div>
                )}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.type === "Penambahan"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {item.type}
                </span>
              </td>
              <td className="px-5 py-4 text-right">{item.before}</td>
              <td
                className={`px-5 py-4 text-right font-semibold ${
                  item.type === "Penambahan"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {item.type === "Penambahan" ? "+" : "-"}
                {item.quantity}
              </td>
              <td className="px-5 py-4 text-right font-semibold">
                {item.after}
              </td>
              <td className="px-5 py-4 text-slate-500">{item.reason}</td>
            </tr>
          ))}

          {filteredAdjustments.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-16 text-center">
                <History
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="font-medium">Belum ada riwayat penyesuaian</p>
                <p className="mt-1 text-xs text-slate-500">
                  Gunakan tombol Penyesuaian Baru untuk mencatat koreksi.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
      Menampilkan {filteredAdjustments.length} dari {adjustments.length} transaksi
    </div>
  </div>

  {showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">Penyesuaian Stok Baru</h2>
            <p className="mt-1 text-xs text-slate-500">
              Periksa perubahan stok sebelum menyimpan.
            </p>
          </div>
          <button
            onClick={() => setShowForm(false)}
            aria-label="Tutup formulir"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={saveAdjustment} className="space-y-5 p-6">
          <FormField label="Spare Part *">
            <select
              required
              value={partId}
              onChange={(event) => {
                setPartId(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih spare part</option>
              {parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.code} - {part.name}
                </option>
              ))}
            </select>
          </FormField>

          {selectedPart && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Stok Sistem</p>
                <p className="mt-1 text-2xl font-bold">
                  {selectedPart.stock}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">Stok Setelah Koreksi</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    projectedStock < 0 ? "text-rose-600" : "text-blue-700"
                  }`}
                >
                  {projectedStock}
                </p>
              </div>
            </div>
          )}

          <FormField label="Jenis Penyesuaian *">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("Penambahan");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${
                  type === "Penambahan"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowDownToLine size={17} />
                Penambahan
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("Pengurangan");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${
                  type === "Pengurangan"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowUpFromLine size={17} />
                Pengurangan
              </button>
            </div>
          </FormField>

          <FormField label="Jumlah Unit *">
            <input
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FormField>

          <FormField label="Alasan Penyesuaian *">
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Catatan">
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tambahkan keterangan atau referensi stock opname..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FormField>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Simpan Penyesuaian
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
color,
}: {
title: string;
value: number;
description: string;
icon: React.ReactNode;
color: "blue" | "emerald" | "rose";
}) {
const colors = {
blue: "bg-blue-50 text-blue-600",
emerald: "bg-emerald-50 text-emerald-600",
rose: "bg-rose-50 text-rose-600",
};

return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between"> <div> <p className="text-sm text-slate-500">{title}</p> <p className="mt-2 text-3xl font-bold">{value}</p> <p className="mt-1 text-xs text-slate-500">{description}</p> </div>
<div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div> </div> </div>
);
}

function FormField({
label,
children,
}: {
label: string;
children: React.ReactNode;
}) {
return ( <div className="space-y-2"> <label className="block text-sm font-medium text-slate-700">
{label} </label>
{children} </div>
);
}
