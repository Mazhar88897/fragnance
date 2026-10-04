import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getUserWithPayment } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getAuthFromCookies();
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Not signed in." },
        { status: 401 }
      );
    }

    const result = await getUserWithPayment(session.id);
    if (!result) {
      return NextResponse.json(
        { ok: false, message: "User not found." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: result.publicUser,
      payment: result.payment,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load user.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
