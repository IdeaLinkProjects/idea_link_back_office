import { Suspense } from "react";
import { AcceptAdminInvite } from "@/components/AcceptAdminInvite";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
          <p className="text-sm text-slate-300">Loading invitation...</p>
        </main>
      }
    >
      <AcceptAdminInvite />
    </Suspense>
  );
}
