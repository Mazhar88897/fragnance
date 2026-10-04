import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  authCookieOptions,
  getAuthFromCookies,
  signAuthToken,
} from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";
import { getUserWithPayment } from "@/lib/subscription";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to edit your profile." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      businessName?: string;
      businessEmail?: string;
    };

    const name = body.name?.trim() ?? "";
    const businessName = body.businessName?.trim() ?? "";
    const businessEmail = body.businessEmail?.trim().toLowerCase() || null;

    if (!name || !businessName) {
      return NextResponse.json(
        { ok: false, message: "Name and business name are required." },
        { status: 400 }
      );
    }

    if (businessEmail && !emailPattern.test(businessEmail)) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid business email, or leave it blank." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    await users.updateOne(
      { _id: new ObjectId(auth.id) },
      {
        $set: {
          name,
          businessName,
          businessEmail,
          updated_at: new Date(),
        },
      }
    );

    const next = await getUserWithPayment(auth.id);
    if (!next) {
      return NextResponse.json(
        { ok: false, message: "Could not load updated profile." },
        { status: 500 }
      );
    }

    const token = signAuthToken(next.publicUser);
    const response = NextResponse.json({
      ok: true,
      user: next.publicUser,
    });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update profile.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
