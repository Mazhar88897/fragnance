import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  getStripe,
  MEMBERSHIP_AMOUNT_PENCE,
  MEMBERSHIP_CURRENCY,
} from "@/lib/stripe";
import { getUserWithPayment } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to pay." },
        { status: 401 }
      );
    }

    const current = await getUserWithPayment(auth.id);
    if (current?.payment.paymentStatus) {
      return NextResponse.json(
        { ok: false, message: "This account is already paid for the current period." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: auth.email,
      client_reference_id: auth.id,
      metadata: { userId: auth.id },
      subscription_data: {
        metadata: { userId: auth.id },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: MEMBERSHIP_CURRENCY,
            unit_amount: MEMBERSHIP_AMOUNT_PENCE,
            recurring: { interval: "month" },
            product_data: {
              name: "Majlis organisation membership",
              description: "£10 a month, renews automatically.",
            },
          },
        },
      ],
      success_url: `${origin}/dashboard/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, message: "Could not start checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
