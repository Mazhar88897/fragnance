import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminFromCookies, toPublicUser } from "@/lib/auth";
import { parseGatheringInput, toPublicGathering } from "@/lib/gathering-posts";
import { getPostedGatheringsCollection, getUsersCollection } from "@/lib/mongodb";

type RouteContext = { params: Promise<{ id: string }> };

async function getAdminPostedGathering(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const [gatherings, users] = await Promise.all([
    getPostedGatheringsCollection(),
    getUsersCollection(),
  ]);
  const doc = await gatherings.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  const poster = await users.findOne({ _id: doc.posted_by });
  if (!poster || !toPublicUser(poster).isAdmin) return null;
  return doc;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const doc = await getAdminPostedGathering(id);
    if (!doc) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      gathering: toPublicGathering(doc),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load gathering.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await getAdminPostedGathering(id);
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as { approval?: boolean };
    if (typeof body.approval !== "boolean") {
      return NextResponse.json(
        { ok: false, message: "Approval is required." },
        { status: 400 }
      );
    }

    const collection = await getPostedGatheringsCollection();
    const updated = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { approval: body.approval, updated_at: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Gathering not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      gathering: toPublicGathering(updated),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update gathering.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
