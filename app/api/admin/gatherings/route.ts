import { NextResponse } from "next/server";
import { getAdminFromCookies, toPublicUser } from "@/lib/auth";
import {
  ownerId,
  parseGatheringInput,
  toPublicGathering,
} from "@/lib/gathering-posts";
import { getPostedGatheringsCollection, getUsersCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const [gatherings, users] = await Promise.all([
      getPostedGatheringsCollection(),
      getUsersCollection(),
    ]);
    const docs = await gatherings.find({}).sort({ datetime: -1 }).toArray();
    const posters = await users
      .find({ _id: { $in: docs.map((doc) => doc.posted_by) } })
      .toArray();
    const posterById = new Map(
      posters.map((user) => [String(user._id), toPublicUser(user)])
    );

    return NextResponse.json({
      ok: true,
      gatherings: docs.map((doc) => ({
        ...toPublicGathering(doc),
        organisation: posterById.get(String(doc.posted_by)) ?? null,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load gatherings.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const fields = parseGatheringInput(
      (await request.json()) as Record<string, unknown>
    );
    const now = new Date();
    const doc = {
      posted_by: ownerId(admin.id),
      ...fields,
      approval: true,
      created_at: now,
      updated_at: now,
    };

    const collection = await getPostedGatheringsCollection();
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
