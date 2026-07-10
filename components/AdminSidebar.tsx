"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Scale,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";

type MenuLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type MenuSection = {
  label: string;
  icon: typeof LayoutDashboard;
  children: MenuLink[];
};

const menuItems: MenuLink[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
  { label: "KYC", icon: ShieldCheck, href: "/dashboard/kyc" },
  { label: "Users", icon: Users, href: "/dashboard/users" },
  { label: "Bank Account", icon: Landmark, href: "/dashboard/bank-accounts" },
  { label: "Admins", icon: UserCog, href: "/dashboard/admins" },
];

const financeSection: MenuSection = {
  label: "Finance",
  icon: Scale,
  children: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/finance" },
    { label: "Wallets", icon: Wallet, href: "/dashboard/finance/wallets" },
    { label: "Payments", icon: ArrowLeftRight, href: "/dashboard/finance/payments" },
    { label: "Reconciliation", icon: Scale, href: "/dashboard/finance/reconciliation" },
  ],
};

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  if (href === "/dashboard/finance") {
    return pathname === href;
  }

  if (href === "/dashboard/finance/wallets") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const financeActive = pathname.startsWith("/dashboard/finance");
  const [financeOpen, setFinanceOpen] = useState(financeActive);

  useEffect(() => {
    if (financeActive) {
      setFinanceOpen(true);
    }
  }, [financeActive]);

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
          <AppLogo className="w-40" priority />
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
          {menuItems.slice(0, 4).map(({ label, icon: Icon, href }) => {
            const active = isActivePath(pathname, href);

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

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setFinanceOpen((open) => !open)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                financeActive
                  ? "bg-emerald-900/50 text-emerald-50"
                  : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-emerald-50"
              }`}
              aria-expanded={financeOpen}
            >
              <financeSection.icon size={16} />
              <span className="flex-1 font-medium">{financeSection.label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${financeOpen ? "rotate-180" : ""}`}
              />
            </button>

            {financeOpen ? (
              <div className="mt-1 space-y-1 border-l border-emerald-900/70 ml-4 pl-2">
                {financeSection.children.map(({ label, icon: Icon, href }) => {
                  const active = isActivePath(pathname, href);

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={onClose}
                      className={
                        active
                          ? "flex w-full items-center gap-2.5 rounded-lg bg-emerald-700/80 px-2.5 py-2 text-left text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-600"
                          : "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-emerald-200/80 transition-colors hover:bg-emerald-900/60 hover:text-emerald-50"
                      }
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {menuItems.slice(4).map(({ label, icon: Icon, href }) => {
            const active = isActivePath(pathname, href);

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
