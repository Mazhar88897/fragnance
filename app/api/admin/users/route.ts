import { NextResponse } from "next/server";
import { listAccountsByAdminFlag } from "@/lib/admin-users";

export async function GET() {
  try {
    const result = await listAccountsByAdminFlag(false);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({ ok: true, users: result.users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load users.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
