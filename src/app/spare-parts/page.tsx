"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
Search,
Plus,
Package,
Pencil,
Trash2,
X,
Download,
Boxes,
AlertTriangle,
Filter,
} from "lucide-react";

type SparePart = {
id: number;
code: string;
name: string;
category: string;
warehouse: string;
unit: string;
stock: number;
minStock: number;
price: number;
};

type PartForm = Omit<SparePart, "id">;

const initialParts: SparePart[] = [
{
id: 1,
code: "BRG-0001",
name: "Bearing 6204 ZZ",
category: "Bearing",
warehouse: "Gudang A",
unit: "pcs",
stock: 24,
minStock: 10,
price: 45000,
},
{
id: 2,
code: "BRG-0002",
name: "Bearing 6205 2RS",
category: "Bearing",
warehouse: "Gudang A",
unit: "pcs",
stock: 6,
minStock: 10,
price: 58000,
},
{
id: 3,
code: "BLT-0001",
name: "V-Belt A-42",
category: "Belt",
warehouse: "Gudang B",
unit: "pcs",
stock: 18,
minStock: 5,
price: 32000,
},
{
id: 4,
code: "MTR-0001",
name: "Motor 3 Phase 1.5 kW",
category: "Motor",
warehouse: "Gudang A",
unit: "unit",
stock: 3,
minStock: 2,
price: 1850000,
},
{
id: 5,
code: "LBR-0001",
name: "Lubricant Industrial",
category: "Lubricant",
warehouse: "Gudang C",
unit: "liter",
stock: 0,
minStock: 5,
price: 85000,
},
];

const emptyForm: PartForm = {
code: "",
name: "",
category: "Bearing",
warehouse: "Gudang A",
unit: "pcs",
stock: 0,
minStock: 5,
price: 0,
};

function formatRupiah(value: number) {
return new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0,
}).format(value);
}

export default function SparePartsPage() {
const [parts, setParts] = useState<SparePart[]>(initialParts);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("Semua");
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);
const [form, setForm] = useState<PartForm>(emptyForm);

const filteredParts = useMemo(() => {
return parts.filter((part) => {
const keyword = search.toLowerCase();

  const matchSearch =
    part.code.toLowerCase().includes(keyword) ||
    part.name.toLowerCase().includes(keyword) ||
    part.category.toLowerCase().includes(keyword) ||
    part.warehouse.toLowerCase().includes(keyword);

  let matchFilter = true;

  if (filter === "Aman") {
    matchFilter = part.stock > part.minStock;
  } else if (filter === "Menipis") {
    matchFilter = part.stock > 0 && part.stock <= part.minStock;
  } else if (filter === "Habis") {
    matchFilter = part.stock === 0;
  }

  return matchSearch && matchFilter;
});

}, [parts, search, filter]);

const totalStock = parts.reduce((sum, part) => sum + part.stock, 0);
const lowStock = parts.filter(
(part) => part.stock > 0 && part.stock <= part.minStock
).length;
const outOfStock = parts.filter((part) => part.stock === 0).length;

function openAddForm() {
setEditingId(null);
setForm({
...emptyForm,
code: "BRG-" + String(Date.now()).slice(-6),
});
setShowForm(true);
}

function openEditForm(part: SparePart) {
setEditingId(part.id);
setForm({
code: part.code,
name: part.name,
category: part.category,
warehouse: part.warehouse,
unit: part.unit,
stock: part.stock,
minStock: part.minStock,
price: part.price,
});
setShowForm(true);
}

function savePart(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

const code = form.code.trim();
const name = form.name.trim();

if (!code || !name) {
  window.alert("Kode dan nama spare part wajib diisi.");
  return;
}

if (
  parts.some(
    (part) =>
      part.code.toLowerCase() === code.toLowerCase() &&
      part.id !== editingId
  )
) {
  window.alert("Kode spare part sudah digunakan.");
  return;
}

if (
  form.stock < 0 ||
  form.minStock < 0 ||
  form.price < 0 ||
  !Number.isFinite(form.stock) ||
  !Number.isFinite(form.minStock) ||
  !Number.isFinite(form.price)
) {
  window.alert("Stok dan harga harus bernilai nol atau lebih.");
  return;
}

if (editingId !== null) {
  setParts((current) =>
    current.map((part) =>
      part.id === editingId
        ? { ...form, id: editingId, code, name }
        : part
    )
  );
} else {
  setParts((current) => [
    ...current,
    { ...form, id: Date.now(), code, name },
  ]);
}

setShowForm(false);

}

function deletePart(part: SparePart) {
if (!window.confirm("Hapus spare part " + part.name + "?")) return;

setParts((current) =>
  current.filter((item) => item.id !== part.id)
);

}

function exportCsv() {
const header = [
"Kode",
"Nama",
"Kategori",
"Gudang",
"Satuan",
"Stok",
"Stok Minimum",
"Harga",
];
const rows = filteredParts.map((part) => [
  part.code,
  part.name,
  part.category,
  part.warehouse,
  part.unit,
  part.stock,
  part.minStock,
  part.price,
]);

function escapeCsv(value: string | number) {
  return '"' + String(value).split('"').join('""') + '"';
}

const csv = [header, ...rows]
  .map((row) => row.map(escapeCsv).join(","))
  .join("\r\n");

const blob = new Blob(["\uFEFF" + csv], {
  type: "text/csv;charset=utf-8;",
});

const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "spare-parts.csv";
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);
}

function getStatus(part: SparePart) {
if (part.stock === 0) {
return {
label: "Habis",
className: "bg-red-50 text-red-700 ring-red-600/20",
};
}

if (part.stock <= part.minStock) {
  return {
    label: "Menipis",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
}

return {
  label: "Aman",
  className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

}

return (<div className="space-y-7 pb-10"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <p className="text-sm text-slate-500">
Inventory / Spare Parts </p> <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
Master Spare Part </h1> <p className="mt-1 text-sm text-slate-500">
Kelola data, stok, dan informasi spare part perusahaan. </p> </div>

    <button
      type="button"
      onClick={openAddForm}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
    >
      <Plus size={18} />
      Tambah Spare Part
    </button>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <SummaryCard
      title="Total Jenis Part"
      value={parts.length.toLocaleString("id-ID")}
      description="Jenis spare part terdaftar"
      icon={<Package size={21} />}
      iconClass="bg-blue-50 text-blue-600"
    />
    <SummaryCard
      title="Total Stok"
      value={totalStock.toLocaleString("id-ID")}
      description="Jumlah seluruh unit stok"
      icon={<Boxes size={21} />}
      iconClass="bg-violet-50 text-violet-600"
    />
    <SummaryCard
      title="Stok Menipis"
      value={lowStock.toLocaleString("id-ID")}
      description="Perlu segera diperiksa"
      icon={<AlertTriangle size={21} />}
      iconClass="bg-amber-50 text-amber-600"
    />
    <SummaryCard
      title="Stok Habis"
      value={outOfStock.toLocaleString("id-ID")}
      description="Part dengan stok nol"
      icon={<Package size={21} />}
      iconClass="bg-red-50 text-red-600"
    />
  </div>

  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="font-semibold text-slate-900">
          Daftar Spare Part
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Menampilkan {filteredParts.length} dari {parts.length} data
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
            placeholder="Cari kode atau nama part..."
            aria-label="Cari spare part"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-64"
          />
        </div>

        <div className="relative">
          <Filter
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter stok"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-blue-500 sm:w-40"
          >
            <option value="Semua">Semua Stok</option>
            <option value="Aman">Stok Aman</option>
            <option value="Menipis">Stok Menipis</option>
            <option value="Habis">Stok Habis</option>
          </select>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Spare Part</th>
            <th className="px-5 py-4 font-semibold">Kategori</th>
            <th className="px-5 py-4 font-semibold">Gudang</th>
            <th className="px-5 py-4 font-semibold">Stok</th>
            <th className="px-5 py-4 font-semibold">Stok Minimum</th>
            <th className="px-5 py-4 font-semibold">Harga</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 text-right font-semibold">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredParts.map((part) => {
            const status = getStatus(part);

            return (
              <tr key={part.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package size={19} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {part.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {part.code}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{part.category}</td>
                <td className="px-5 py-4 text-slate-600">{part.warehouse}</td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-slate-800">
                    {part.stock}
                  </span>{" "}
                  <span className="text-slate-500">{part.unit}</span>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {part.minStock} {part.unit}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                  {formatRupiah(part.price)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " +
                      status.className
                    }
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(part)}
                      title="Edit spare part"
                      aria-label={"Edit " + part.name}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePart(part)}
                      title="Hapus spare part"
                      aria-label={"Hapus " + part.name}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {filteredParts.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-16 text-center">
                <Package size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  Spare part tidak ditemukan
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ubah kata kunci pencarian atau filter stok.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Data contoh SpareHub</span>
      <span>{filteredParts.length} data ditampilkan</span>
    </div>
  </section>

  {showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId === null ? "Tambah Spare Part" : "Edit Spare Part"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lengkapi informasi spare part.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            aria-label="Tutup formulir"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={savePart}>
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            <FormField label="Kode Spare Part">
              <input
                required
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value })
                }
                className="form-input"
                placeholder="Contoh: BRG-0006"
              />
            </FormField>

            <FormField label="Nama Spare Part">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="form-input"
                placeholder="Masukkan nama part"
              />
            </FormField>

            <FormField label="Kategori">
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="form-input"
              >
                <option>Bearing</option>
                <option>Belt</option>
                <option>Motor</option>
                <option>Electrical</option>
                <option>Lubricant</option>
                <option>Pneumatic</option>
                <option>Hydraulic</option>
                <option>Mechanical</option>
                <option>Lainnya</option>
              </select>
            </FormField>

            <FormField label="Lokasi Gudang">
              <select
                value={form.warehouse}
                onChange={(event) =>
                  setForm({ ...form, warehouse: event.target.value })
                }
                className="form-input"
              >
                <option>Gudang A</option>
                <option>Gudang B</option>
                <option>Gudang C</option>
              </select>
            </FormField>

            <FormField label="Satuan">
              <select
                value={form.unit}
                onChange={(event) =>
                  setForm({ ...form, unit: event.target.value })
                }
                className="form-input"
              >
                <option>pcs</option>
                <option>unit</option>
                <option>set</option>
                <option>liter</option>
                <option>meter</option>
                <option>roll</option>
                <option>box</option>
              </select>
            </FormField>

            <FormField label="Harga Satuan (Rp)">
              <input
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: Number(event.target.value) })
                }
                className="form-input"
              />
            </FormField>

            <FormField label="Stok Saat Ini">
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(event) =>
                  setForm({ ...form, stock: Number(event.target.value) })
                }
                className="form-input"
              />
            </FormField>

            <FormField label="Stok Minimum">
              <input
                type="number"
                min="0"
                required
                value={form.minStock}
                onChange={(event) =>
                  setForm({
                    ...form,
                    minStock: Number(event.target.value),
                  })
                }
                className="form-input"
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Simpan Spare Part
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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={"rounded-xl p-3 " + iconClass}>{icon}</div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}


function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}