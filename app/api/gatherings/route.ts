import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  ownerId,
  parseGatheringInput,
  toPublicGathering,
} from "@/lib/gathering-posts";
import { getPostedGatheringsCollection } from "@/lib/mongodb";
import { getUserWithPayment } from "@/lib/subscription";

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to view gatherings." },
        { status: 401 }
      );
    }

    const collection = await getPostedGatheringsCollection();
    const docs = await collection
      .find({ posted_by: ownerId(auth.id) })
      .sort({ datetime: -1 })
      .toArray();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const postedThisMonth = docs.filter((doc) => doc.created_at >= monthStart)
      .length;

    return NextResponse.json({
      ok: true,
      gatherings: docs.map(toPublicGathering),
      postedThisMonth,
      monthlyLimit: 10,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load gatherings.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in to add a gathering." },
        { status: 401 }
      );
    }

    const paid = await getUserWithPayment(auth.id);
    if (!paid?.payment.paymentStatus) {
      return NextResponse.json(
        { ok: false, message: "Pay for a membership to post gatherings." },
        { status: 403 }
      );
    }

    const collection = await getPostedGatheringsCollection();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const postedThisMonth = await collection.countDocuments({
      posted_by: ownerId(auth.id),
      created_at: { $gte: monthStart },
    });
    if (postedThisMonth >= 10) {
      return NextResponse.json(
        { ok: false, message: "You have reached this month's posting limit." },
        { status: 400 }
      );
    }

    const fields = parseGatheringInput(
      (await request.json()) as Record<string, unknown>
    );

    const doc = {
      posted_by: ownerId(auth.id),
      ...fields,
      approval: false,
      created_at: now,
      updated_at: now,
    };
    const result = await collection.insertOne(doc);

    return NextResponse.json({
      ok: true,
      gathering: toPublicGathering({ ...doc, _id: result.insertedId }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save gathering.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
