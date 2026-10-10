
"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Building2,
  Warehouse,
  Package,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

type SettingsData = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  warehouseName: string;
  warehouseAddress: string;
  minStock: string;
  currency: string;
  dateFormat: string;
  lowStockNotification: boolean;
  stockMovementNotification: boolean;
};

const defaultSettings: SettingsData = {
  companyName: "SpareHub",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  warehouseName: "Gudang Utama",
  warehouseAddress: "",
  minStock: "5",
  currency: "IDR",
  dateFormat: "DD/MM/YYYY",
  lowStockNotification: true,
  stockMovementNotification: true,
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sparehub-settings");

      if (stored) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(stored),
        });
      }
    } catch {
      // Gunakan pengaturan default jika data browser tidak valid.
    }

    setLoaded(true);
  }, []);

  function update<K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem("sparehub-settings", JSON.stringify(settings));
      setSaved(true);
    } catch {
      window.alert("Pengaturan gagal disimpan di browser.");
    }
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Kembalikan semua pengaturan ke nilai default?"
    );

    if (!confirmed) return;

    setSettings(defaultSettings);

    try {
      localStorage.setItem(
        "sparehub-settings",
        JSON.stringify(defaultSettings)
      );
      setSaved(true);
    } catch {
      setSaved(false);
      window.alert("Pengaturan default diterapkan, tetapi gagal disimpan.");
    }
  }

  if (!loaded) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Settings size={17} className="text-blue-600" />
            Inventory / Settings
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pengaturan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola informasi perusahaan dan preferensi SpareHub.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetSettings}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            onClick={saveSettings}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Save size={17} />
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={20} />
          <span>Pengaturan berhasil disimpan di browser ini.</span>
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Settings size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              SpareHub Control Center
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pengaturan operasional dan preferensi sistem inventory.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Mode pengaturan lokal · Database belum terhubung
            </p>
          </div>
        </div>
      </div>

      <Section
        title="Profil Perusahaan"
        description="Informasi dasar perusahaan atau pemilik inventory."
        icon={<Building2 size={21} />}
      >
        <Field
          label="Nama Perusahaan"
          value={settings.companyName}
          onChange={(value) => update("companyName", value)}
          placeholder="Nama perusahaan"
        />
        <Field
          label="Nomor Telepon"
          value={settings.companyPhone}
          onChange={(value) => update("companyPhone", value)}
          placeholder="Contoh: 081234567890"
        />
        <Field
          label="Email Perusahaan"
          value={settings.companyEmail}
          onChange={(value) => update("companyEmail", value)}
          placeholder="admin@perusahaan.com"
          type="email"
        />
        <Field
          label="Alamat Perusahaan"
          value={settings.companyAddress}
          onChange={(value) => update("companyAddress", value)}
          placeholder="Alamat lengkap perusahaan"
        />
      </Section>

      <Section
        title="Pengaturan Gudang"
        description="Informasi lokasi penyimpanan barang."
        icon={<Warehouse size={21} />}
      >
        <Field
          label="Nama Gudang Utama"
          value={settings.warehouseName}
          onChange={(value) => update("warehouseName", value)}
          placeholder="Gudang Utama"
        />
        <Field
          label="Alamat Gudang"
          value={settings.warehouseAddress}
          onChange={(value) => update("warehouseAddress", value)}
          placeholder="Lokasi gudang"
        />
      </Section>

      <Section
        title="Pengaturan Persediaan"
        description="Tentukan batas minimum dan format data inventory."
        icon={<Package size={21} />}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Batas Minimum Stok Default
          </label>
          <input
            type="number"
            min="0"
            value={settings.minStock}
            onChange={(event) =>
              update("minStock", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            Nilai default untuk barang baru. Tidak mengubah stok minimum
            barang yang sudah ada pada tahap ini.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mata Uang
          </label>
          <select
            value={settings.currency}
            onChange={(event) => update("currency", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="IDR">IDR - Rupiah Indonesia</option>
            <option value="USD">USD - US Dollar</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Format Tanggal
          </label>
          <select
            value={settings.dateFormat}
            onChange={(event) => update("dateFormat", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
      </Section>

      <Section
        title="Notifikasi"
        description="Atur preferensi peringatan inventory."
        icon={<Bell size={21} />}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Peringatan Stok Minimum
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Preferensi untuk peringatan ketika stok mencapai batas minimum.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.lowStockNotification}
            onClick={() =>
              update(
                "lowStockNotification",
                !settings.lowStockNotification
              )
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              settings.lowStockNotification
                ? "bg-blue-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                settings.lowStockNotification ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Aktivitas Barang Masuk dan Keluar
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Preferensi untuk pemberitahuan perubahan pergerakan stok.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.stockMovementNotification}
            onClick={() =>
              update(
                "stockMovementNotification",
                !settings.stockMovementNotification
              )
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              settings.stockMovementNotification
                ? "bg-blue-600"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                settings.stockMovementNotification
                  ? "left-5"
                  : "left-0.5"
              }`}
            />
          </button>
        </div>
      </Section>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-slate-800">
            Simpan perubahan
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Pengaturan lokal ini belum dibagikan ke pengguna atau perangkat lain.
          </p>
        </div>
        <button
          onClick={saveSettings}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Save size={17} />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}