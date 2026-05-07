"use client";

import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
  { label: "KYC", icon: ShieldCheck, href: "/dashboard/kyc" },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
    document.cookie = "refreshToken=; path=/; max-age=0; samesite=lax";
    onClose();
    router.push("/");
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-800 bg-black/95 p-4 text-slate-100 shadow-2xl transition-transform duration-200 lg:left-6 lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:w-64 lg:rounded-2xl lg:border lg:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <p className="text-xl font-semibold tracking-tight">Task Pro.</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-900/60 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-6 space-y-1.5">
          {menuItems.map(({ label, icon: Icon, href }) => {
            const active = href !== "#" && pathname === href;

            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={
                  active
                    ? "flex w-full items-center gap-3 rounded-xl bg-emerald-700/80 px-3 py-2.5 text-left text-sm font-medium text-emerald-50 shadow-sm transition-colors hover:bg-emerald-600"
                    : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-200/90 transition-colors hover:bg-emerald-900/60 hover:text-emerald-50"
                }
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-200/90 transition-colors hover:bg-emerald-900/60 hover:text-emerald-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
    </>
  );
}
