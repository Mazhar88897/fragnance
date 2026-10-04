import { NextResponse } from "next/server";
import { isAdminEmail, isSuperAdminEmail } from "@/lib/auth-types";
import { getUsersCollection } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      businessName?: string;
      businessEmail?: string;
      password?: string;
      passwordAgain?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const businessName = body.businessName?.trim() ?? "";
    const businessEmail = body.businessEmail?.trim().toLowerCase() || null;
    const password = body.password ?? "";
    const passwordAgain = body.passwordAgain ?? "";

    if (!name || !email || !businessName || !password || !passwordAgain) {
      return NextResponse.json(
        { ok: false, message: "Name, email, business name, and both passwords are required." },
        { status: 400 }
      );
    }

    if (password !== passwordAgain) {
      return NextResponse.json(
        { ok: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (businessEmail && !emailPattern.test(businessEmail)) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid business email, or leave it blank." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const now = new Date();
    await users.insertOne({
      name,
      email,
      businessName,
      businessEmail,
      passwordHash: await hashPassword(password),
      paymentStatus: false,
      isAdmin: isAdminEmail(email) || isSuperAdminEmail(email),
      isSuperAdmin: isSuperAdminEmail(email),
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create account.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
