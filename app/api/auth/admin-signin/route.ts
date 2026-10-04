import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  authCookieOptions,
  signAuthToken,
  toPublicUser,
} from "@/lib/auth";
import { isAdminEmail, isSuperAdminEmail } from "@/lib/auth-types";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    const valid = user && (await verifyPassword(password, user.passwordHash));

    if (!user || !valid) {
      return NextResponse.json(
        { ok: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const shouldBeAdmin =
      Boolean(user.isAdmin) ||
      isAdminEmail(user.email) ||
      isSuperAdminEmail(user.email);
    if (!shouldBeAdmin) {
      return NextResponse.json(
        { ok: false, message: "This account is not an admin." },
        { status: 403 }
      );
    }

    const shouldBeSuperAdmin =
      Boolean(user.isSuperAdmin) || isSuperAdminEmail(user.email);
    if (
      user.isAdmin !== true ||
      user.isSuperAdmin !== shouldBeSuperAdmin
    ) {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            isAdmin: true,
            isSuperAdmin: shouldBeSuperAdmin,
            updated_at: new Date(),
          },
        }
      );
      user.isAdmin = true;
      user.isSuperAdmin = shouldBeSuperAdmin;
    }

    const publicUser = toPublicUser(user);
    const token = signAuthToken(publicUser);
    const response = NextResponse.json({
      ok: true,
      token,
      user: publicUser,
    });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
