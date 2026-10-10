"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Package,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "warning" | "info";
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Stok menipis",
    description: "Brake Pad Toyota Avanza tersisa 4 unit.",
    time: "Baru saja",
    type: "warning",
    read: false,
  },
  {
    id: 2,
    title: "Periksa stok minimum",
    description: "Oil Filter Premium tersisa 7 unit.",
    time: "Hari ini",
    type: "warning",
    read: false,
  },
  {
    id: 3,
    title: "Inventory siap digunakan",
    description: "Dashboard SpareHub berhasil dimuat.",
    time: "Hari ini",
    type: "info",
    read: false,
  },
];

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    const savedTheme = localStorage.getItem("sparehub-theme");
    const isDark = savedTheme === "dark";

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark
      ? "dark"
      : "light";
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle(
      "dark",
      nextDarkMode
    );
    document.documentElement.style.colorScheme = nextDarkMode
      ? "dark"
      : "light";

    localStorage.setItem(
      "sparehub-theme",
      nextDarkMode ? "dark" : "light"
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  return (
    <header
      className={`sticky top-0 z-30 flex h-[76px] items-center justify-between border-b px-4 backdrop-blur-xl transition-colors sm:px-8 ${
        darkMode
          ? "border-slate-700 bg-slate-900/95"
          : "border-slate-200 bg-white/90"
      }`}
    >
      <div>
        <p
          className={`text-xs font-medium ${
            darkMode ? "text-slate-400" : "text-slate-400"
          }`}
        >
          SPAREHUB / WORKSPACE
        </p>

        <h2
          className={`mt-1 text-lg font-semibold tracking-tight ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Inventory Overview
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            darkMode ? "Switch to light mode" : "Switch to dark mode"
          }
          title={darkMode ? "Light Mode" : "Dark Mode"}
          className={`rounded-xl border p-2.5 transition ${
            darkMode
              ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() =>
              setNotificationsOpen((current) => !current)
            }
            className={`relative rounded-xl border p-2.5 transition ${
              darkMode
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
                <span className="sr-only">
                  {unreadCount} unread notifications
                </span>
              </>
            )}
          </button>

          {notificationsOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setNotificationsOpen(false)}
              />

              <div
                className={`absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-xl ${
                  darkMode
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b p-4 ${
                    darkMode
                      ? "border-slate-700"
                      : "border-slate-100"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Notifications
                    </h3>

                    <p
                      className={`mt-1 text-xs ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {unreadCount} unread notifications
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setNotificationsOpen(false)}
                    className={`rounded-lg p-1.5 ${
                      darkMode
                        ? "text-slate-400 hover:bg-slate-800"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell
                        size={28}
                        className={`mx-auto mb-3 ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-300"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          darkMode
                            ? "text-slate-300"
                            : "text-slate-600"
                        }`}
                      >
                        No notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`flex w-full gap-3 border-b p-4 text-left transition last:border-b-0 ${
                          darkMode
                            ? "border-slate-800 hover:bg-slate-800"
                            : "border-slate-100 hover:bg-slate-50"
                        } ${
                          !notification.read
                            ? darkMode
                              ? "bg-blue-950/20"
                              : "bg-blue-50/40"
                            : ""
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            notification.type === "warning"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {notification.type === "warning" ? (
                            <AlertTriangle size={19} />
                          ) : (
                            <Package size={19} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                darkMode
                                  ? "text-slate-100"
                                  : "text-slate-800"
                              }`}
                            >
                              {notification.title}
                            </span>

                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                            )}
                          </span>

                          <span
                            className={`mt-1 block text-xs leading-5 ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {notification.description}
                          </span>

                          <span
                            className={`mt-2 block text-[11px] ${
                              darkMode
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {notification.time}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                {unreadCount > 0 && (
                  <div
                    className={`border-t p-3 ${
                      darkMode
                        ? "border-slate-700"
                        : "border-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Check size={16} />
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Administrator profile */}
        <div
          className={`flex items-center gap-3 border-l pl-3 sm:pl-4 ${
            darkMode ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            SH
          </div>

          <div className="hidden sm:block">
            <p
              className={`text-sm font-semibold ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Administrator
            </p>

            <p
              className={`text-xs ${
                darkMode ? "text-slate-400" : "text-slate-400"
              }`}
            >
              Inventory Manager
            </p>
          </div>

          <ChevronDown
            size={16}
            className={
              darkMode ? "text-slate-400" : "text-slate-400"
            }
          />
        </div>
      </div>
    </header>
  );
}