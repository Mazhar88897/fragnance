import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  authCookieOptions,
  getAuthFromCookies,
  signAuthToken,
} from "@/lib/auth";
import { getUserWithPayment } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to cancel." },
        { status: 401 }
      );
    }

    const result = await getUserWithPayment(auth.id);
    if (!result) {
      return NextResponse.json(
        { ok: false, message: "User not found." },
        { status: 404 }
      );
    }

    const subscriptionId = result.payment.stripeSubscriptionId;
    if (!subscriptionId) {
      return NextResponse.json(
        { ok: false, message: "No active subscription to cancel." },
        { status: 400 }
      );
    }

    if (result.payment.cancelAtPeriodEnd) {
      return NextResponse.json({
        ok: true,
        user: result.publicUser,
        payment: result.payment,
      });
    }

    await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const next = await getUserWithPayment(auth.id);
    if (!next) {
      return NextResponse.json(
        { ok: false, message: "Could not refresh subscription." },
        { status: 500 }
      );
    }

    const token = signAuthToken(next.publicUser);
    const response = NextResponse.json({
      ok: true,
      token,
      user: next.publicUser,
      payment: next.payment,
    });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not cancel membership.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
