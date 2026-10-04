import { Suspense } from "react";
import PaySuccessView from "@/components/dashboard/PaySuccessView";

export default function PaySuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-white px-6 py-20">
          <p className="text-[#6b6560]">Confirming payment…</p>
        </main>
      }
    >
      <PaySuccessView />
    </Suspense>
  );
}
