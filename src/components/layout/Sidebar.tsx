"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileBarChart,
  Gauge,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";

const menuGroups = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: Gauge,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        label: "Spare Parts",
        href: "/spare-parts",
        icon: Package,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Boxes,
      },
      {
        label: "Warehouses",
        href: "/warehouses",
        icon: Warehouse,
      },
      {
        label: "Stock Adjustment",
        href: "/stock-adjustment",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "TRANSACTION",
    items: [
      {
        label: "Stock In",
        href: "/stock-in",
        icon: Truck,
      },
      {
        label: "Stock Out",
        href: "/stock-out",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "REPORT",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex h-20 items-center border-b border-slate-800 px-7">
        <div>
          <div className="text-xl font-bold tracking-tight">
            SPARE<span className="text-blue-500">HUB</span>
          </div>

          <div className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Inventory System
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-7">
            <div className="mb-2 px-3 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
              {group.title}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}