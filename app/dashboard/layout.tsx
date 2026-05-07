"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasAccessToken = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith("accessToken="));

    if (!hasAccessToken) {
      router.replace("/");
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-slate-300">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
