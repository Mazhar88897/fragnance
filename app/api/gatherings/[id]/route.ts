import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  ownerId,
  parseGatheringInput,
  toPublicGathering,
} from "@/lib/gathering-posts";
import { getPostedGatheringsCollection } from "@/lib/mongodb";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedGathering(userId: string, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getPostedGatheringsCollection();
  return collection.findOne({
    _id: new ObjectId(id),
    posted_by: ownerId(userId),
  });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const doc = await getOwnedGathering(auth.id, id);
    if (!doc) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, gathering: toPublicGathering(doc) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load gathering.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await getOwnedGathering(auth.id, id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    const fields = parseGatheringInput(
      (await request.json()) as Record<string, unknown>
    );
    const collection = await getPostedGatheringsCollection();
    const updated = await collection.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...fields, updated_at: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Could not update gathering." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      gathering: toPublicGathering(updated),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update gathering.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await getOwnedGathering(auth.id, id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    const collection = await getPostedGatheringsCollection();
    await collection.deleteOne({ _id: existing._id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not cancel gathering.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
