"use client";

import { useMemo, useState } from "react";
import {
Boxes,
Search,
Plus,
Pencil,
Trash2,
X,
Package,
Tags,
} from "lucide-react";

type Category = {
id: number;
name: string;
description: string;
createdAt: string;
};

const initialCategories: Category[] = [
{
id: 1,
name: "Bearing",
description: "Bearing dan komponen bantalan",
createdAt: "2026-10-01",
},
{
id: 2,
name: "Electrical",
description: "Komponen listrik dan kontrol",
createdAt: "2026-10-01",
},
{
id: 3,
name: "Hydraulic",
description: "Komponen sistem hidrolik",
createdAt: "2026-10-02",
},
{
id: 4,
name: "Pneumatic",
description: "Komponen sistem pneumatik",
createdAt: "2026-10-03",
},
{
id: 5,
name: "Mechanical",
description: "Komponen mekanik umum",
createdAt: "2026-10-04",
},
];

export default function CategoriesPage() {
const [categories, setCategories] = useState(initialCategories);
const [search, setSearch] = useState("");
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);
const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [error, setError] = useState("");

const filteredCategories = useMemo(() => {
const keyword = search.toLowerCase().trim();

return categories.filter(
  (category) =>
    category.name.toLowerCase().includes(keyword) ||
    category.description.toLowerCase().includes(keyword)
);

}, [categories, search]);

function openAddForm() {
setEditingId(null);
setName("");
setDescription("");
setError("");
setShowForm(true);
}

function openEditForm(category: Category) {
setEditingId(category.id);
setName(category.name);
setDescription(category.description);
setError("");
setShowForm(true);
}

function saveCategory(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

const normalizedName = name.trim();

if (!normalizedName) {
  setError("Nama kategori wajib diisi.");
  return;
}

const duplicate = categories.some(
  (category) =>
    category.name.toLowerCase() === normalizedName.toLowerCase() &&
    category.id !== editingId
);

if (duplicate) {
  setError("Nama kategori sudah digunakan.");
  return;
}

if (editingId !== null) {
  setCategories((current) =>
    current.map((category) =>
      category.id === editingId
        ? {
            ...category,
            name: normalizedName,
            description: description.trim(),
          }
        : category
    )
  );
} else {
  setCategories((current) => [
    ...current,
    {
      id: Math.max(0, ...current.map((category) => category.id)) + 1,
      name: normalizedName,
      description: description.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ]);
}

setShowForm(false);
setName("");
setDescription("");
setEditingId(null);
setError("");

}

function deleteCategory(category: Category) {
const confirmed = window.confirm(
`Hapus kategori "${category.name}"?`
);

if (!confirmed) return;

setCategories((current) =>
  current.filter((item) => item.id !== category.id)
);

}

return ( <div className="min-h-screen space-y-6 bg-slate-50 p-6 text-slate-800"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <div className="flex items-center gap-2 text-sm text-slate-500"> <Boxes size={16} /> <span>Inventory</span> <span>/</span> <span>Categories</span> </div> <h1 className="mt-2 text-3xl font-bold tracking-tight">
Categories </h1> <p className="mt-1 text-sm text-slate-500">
Kelola kategori spare part agar data inventory lebih terorganisir. </p> </div>

    <button
      onClick={openAddForm}
      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
    >
      <Plus size={18} />
      Tambah Kategori
    </button>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Total Kategori</p>
          <p className="mt-2 text-3xl font-bold">{categories.length}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Tags size={24} />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Hasil Pencarian</p>
          <p className="mt-2 text-3xl font-bold">
            {filteredCategories.length}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
          <Package size={24} />
        </div>
      </div>
    </div>
  </div>

  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-semibold">Daftar Kategori</h2>
        <p className="mt-1 text-xs text-slate-500">
          Kelola nama dan deskripsi kategori spare part.
        </p>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kategori..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Kategori</th>
            <th className="px-5 py-4 font-semibold">Deskripsi</th>
            <th className="px-5 py-4 font-semibold">Dibuat</th>
            <th className="px-5 py-4 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredCategories.map((category) => (
            <tr
              key={category.id}
              className="transition hover:bg-slate-50"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Boxes size={19} />
                  </div>
                  <div className="font-semibold">{category.name}</div>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-500">
                {category.description || "-"}
              </td>
              <td className="px-5 py-4 text-slate-500">
                {category.createdAt}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditForm(category)}
                    title="Edit kategori"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    title="Hapus kategori"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-16 text-center">
                <div className="mx-auto mb-3 w-fit rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <Search size={24} />
                </div>
                <p className="font-medium">Kategori tidak ditemukan</p>
                <p className="mt-1 text-xs text-slate-500">
                  Coba kata kunci lain atau tambahkan kategori baru.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
      Menampilkan {filteredCategories.length} dari {categories.length} kategori
    </div>
  </div>

  {showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">
              {editingId !== null ? "Edit Kategori" : "Tambah Kategori"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Lengkapi informasi kategori spare part.
            </p>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup formulir"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={saveCategory} className="space-y-5 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Contoh: Bearing"
              maxLength={80}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Keterangan kategori (opsional)"
              rows={3}
              maxLength={250}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {editingId !== null ? "Simpan Perubahan" : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}
