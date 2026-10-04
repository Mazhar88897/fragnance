"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/lib/auth-types";
import { getUserSession, setUserSession } from "@/lib/user-session";

export default function PaySuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirming payment…");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/dashboard");
      return;
    }

    fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          message?: string;
          token?: string;
          user?: PublicUser;
        };
        if (!res.ok || !json.ok || !json.user) {
          throw new Error(json.message ?? "Payment could not be confirmed.");
        }

        const current = getUserSession();
        setUserSession({
          token: json.token || current?.token || "",
          user: json.user,
        });
        router.replace("/dashboard?paid=1");
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Payment could not be confirmed."
        );
      });
  }, [router, searchParams]);

  return (
    <main className="bg-white px-6 py-20 sm:px-10">
      <p className="text-[#6b6560]">{message}</p>
    </main>
  );
}
