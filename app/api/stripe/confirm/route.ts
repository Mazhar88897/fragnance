import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  authCookieOptions,
  getAuthFromCookies,
  signAuthToken,
} from "@/lib/auth";
import { markUserPaid } from "@/lib/mark-user-paid";
import { getStripe } from "@/lib/stripe";
import { getUserWithPayment } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to confirm payment." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, message: "Missing checkout session." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paidUserId =
      session.metadata?.userId || session.client_reference_id || "";

    const complete =
      session.status === "complete" &&
      (session.payment_status === "paid" ||
        session.payment_status === "no_payment_required");

    if (!complete || paidUserId !== auth.id) {
      return NextResponse.json(
        { ok: false, message: "Payment is not complete for this account." },
        { status: 400 }
      );
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    const marked = await markUserPaid(auth.id, {
      customerId,
      subscriptionId,
    });
    if (!marked) {
      return NextResponse.json(
        { ok: false, message: "Could not update payment status." },
        { status: 500 }
      );
    }

    const next = await getUserWithPayment(auth.id);
    const user = next?.publicUser ?? marked;
    const token = signAuthToken(user);
    const response = NextResponse.json({
      ok: true,
      token,
      user,
      payment: next?.payment ?? user.payment,
    });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not confirm payment.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
