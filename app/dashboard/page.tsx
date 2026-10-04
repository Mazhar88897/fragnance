import { Suspense } from "react";
import DashboardView from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-white px-6 py-20">
          <p className="text-[#8c857c]">Loading…</p>
        </main>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
