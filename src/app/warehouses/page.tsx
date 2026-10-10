"use client";

import { useMemo, useState } from "react";
import {
Warehouse,
Search,
Plus,
Pencil,
Trash2,
X,
MapPin,
Users,
Building2,
} from "lucide-react";

type WarehouseData = {
id: number;
code: string;
name: string;
location: string;
manager: string;
description: string;
status: "Aktif" | "Nonaktif";
};

const initialWarehouses: WarehouseData[] = [
{
id: 1,
code: "WH-001",
name: "Gudang Utama",
location: "Lantai 1 - Area Produksi",
manager: "Admin Gudang",
description: "Penyimpanan spare part utama",
status: "Aktif",
},
{
id: 2,
code: "WH-002",
name: "Gudang Electrical",
location: "Lantai 2 - Rak E",
manager: "Staff Electrical",
description: "Komponen listrik dan kontrol",
status: "Aktif",
},
{
id: 3,
code: "WH-003",
name: "Gudang Maintenance",
location: "Area Maintenance",
manager: "Team Maintenance",
description: "Spare part untuk kebutuhan perawatan",
status: "Aktif",
},
];

const emptyForm = {
code: "",
name: "",
location: "",
manager: "",
description: "",
status: "Aktif" as "Aktif" | "Nonaktif",
};

export default function WarehousesPage() {
const [warehouses, setWarehouses] = useState(initialWarehouses);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("Semua");
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);
const [form, setForm] = useState(emptyForm);
const [error, setError] = useState("");

const filteredWarehouses = useMemo(() => {
const keyword = search.toLowerCase().trim();

return warehouses.filter((item) => {
  const matchesSearch = [
    item.code,
    item.name,
    item.location,
    item.manager,
  ].some((value) => value.toLowerCase().includes(keyword));

  const matchesStatus =
    statusFilter === "Semua" || item.status === statusFilter;

  return matchesSearch && matchesStatus;
});

}, [warehouses, search, statusFilter]);

const activeCount = warehouses.filter(
(item) => item.status === "Aktif"
).length;

function openAddForm() {
setEditingId(null);
setForm(emptyForm);
setError("");
setShowForm(true);
}

function openEditForm(item: WarehouseData) {
setEditingId(item.id);
setForm({
code: item.code,
name: item.name,
location: item.location,
manager: item.manager,
description: item.description,
status: item.status,
});
setError("");
setShowForm(true);
}

function updateField(
field: keyof typeof emptyForm,
value: string
) {
setForm((current) => ({ ...current, [field]: value }));
setError("");
}

function saveWarehouse(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

const code = form.code.trim().toUpperCase();
const name = form.name.trim();

if (!code || !name) {
  setError("Kode gudang dan nama gudang wajib diisi.");
  return;
}

const duplicateCode = warehouses.some(
  (item) =>
    item.code.toLowerCase() === code.toLowerCase() &&
    item.id !== editingId
);

if (duplicateCode) {
  setError("Kode gudang sudah digunakan.");
  return;
}

if (editingId !== null) {
  setWarehouses((current) =>
    current.map((item) =>
      item.id === editingId
        ? { ...item, ...form, code, name }
        : item
    )
  );
} else {
  setWarehouses((current) => [
    ...current,
    {
      id: Math.max(0, ...current.map((item) => item.id)) + 1,
      ...form,
      code,
      name,
    },
  ]);
}

setShowForm(false);
setEditingId(null);
setForm(emptyForm);
setError("");

}

function deleteWarehouse(item: WarehouseData) {
const confirmed = window.confirm(
`Hapus gudang "${item.name}" (${item.code})?`
);

if (!confirmed) return;

setWarehouses((current) =>
  current.filter((warehouse) => warehouse.id !== item.id)
);

}

return ( <div className="min-h-screen space-y-6 bg-slate-50 p-6 text-slate-800"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <div className="flex items-center gap-2 text-sm text-slate-500"> <Warehouse size={16} /> <span>Inventory</span> <span>/</span> <span>Warehouses</span> </div> <h1 className="mt-2 text-3xl font-bold tracking-tight">
Warehouses </h1> <p className="mt-1 text-sm text-slate-500">
Kelola gudang dan lokasi penyimpanan spare part. </p> </div>

    <button
      onClick={openAddForm}
      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
    >
      <Plus size={18} />
      Tambah Gudang
    </button>
  </div>

  <div className="grid gap-4 sm:grid-cols-3">
    <SummaryCard
      title="Total Gudang"
      value={warehouses.length}
      icon={<Building2 size={22} />}
      color="blue"
    />
    <SummaryCard
      title="Gudang Aktif"
      value={activeCount}
      icon={<Warehouse size={22} />}
      color="emerald"
    />
    <SummaryCard
      title="Gudang Nonaktif"
      value={warehouses.length - activeCount}
      icon={<MapPin size={22} />}
      color="amber"
    />
  </div>

  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
      <div>
        <h2 className="font-semibold">Daftar Gudang</h2>
        <p className="mt-1 text-xs text-slate-500">
          Data lokasi penyimpanan spare part.
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
            placeholder="Cari gudang..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-56"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Kode / Gudang</th>
            <th className="px-5 py-4 font-semibold">Lokasi</th>
            <th className="px-5 py-4 font-semibold">Penanggung Jawab</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredWarehouses.map((item) => (
            <tr key={item.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="font-mono text-xs font-semibold text-blue-600">
                  {item.code}
                </div>
                <div className="mt-1 font-semibold text-slate-800">
                  {item.name}
                </div>
                {item.description && (
                  <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                    {item.description}
                  </div>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={15} className="shrink-0 text-slate-400" />
                  {item.location || "-"}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={15} className="text-slate-400" />
                  {item.manager || "-"}
                </div>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.status === "Aktif"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditForm(item)}
                    title="Edit gudang"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteWarehouse(item)}
                    title="Hapus gudang"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredWarehouses.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center">
                <Warehouse
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="font-medium">Gudang tidak ditemukan</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ubah pencarian atau tambahkan gudang baru.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
      Menampilkan {filteredWarehouses.length} dari {warehouses.length} gudang
    </div>
  </div>

  {showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">
              {editingId !== null ? "Edit Gudang" : "Tambah Gudang"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Lengkapi informasi lokasi penyimpanan.
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

        <form onSubmit={saveWarehouse} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Kode Gudang *">
              <input
                required
                maxLength={30}
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
                placeholder="WH-001"
                className="form-input"
              />
            </FormField>

            <FormField label="Nama Gudang *">
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Gudang Utama"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Lokasi">
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Contoh: Lantai 1 - Rak A"
              className="form-input"
            />
          </FormField>

          <FormField label="Penanggung Jawab">
            <input
              value={form.manager}
              onChange={(event) => updateField("manager", event.target.value)}
              placeholder="Nama penanggung jawab"
              className="form-input"
            />
          </FormField>

          <FormField label="Deskripsi">
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Keterangan gudang"
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="form-input"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </FormField>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
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
              {editingId !== null ? "Simpan Perubahan" : "Simpan Gudang"}
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
icon,
color,
}: {
title: string;
value: number;
icon: React.ReactNode;
color: "blue" | "emerald" | "amber";
}) {
const colors = {
blue: "bg-blue-50 text-blue-600",
emerald: "bg-emerald-50 text-emerald-600",
amber: "bg-amber-50 text-amber-600",
};

return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between"> <p className="text-sm text-slate-500">{title}</p>
<div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div> </div> <p className="mt-3 text-3xl font-bold">{value}</p> </div>
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
