import { NextResponse } from "next/server";
import { getNewsletterEmailsCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const collection = await getNewsletterEmailsCollection();
    const existing = await collection.findOne({ email });

    if (!existing) {
      const now = new Date();
      await collection.insertOne({
        email,
        created_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save email.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
