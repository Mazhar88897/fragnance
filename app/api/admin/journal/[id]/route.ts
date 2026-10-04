import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";
import { parseJournalInput, toPublicJournal } from "@/lib/journal-posts";
import { getJournalCollection } from "@/lib/mongodb";

type RouteContext = { params: Promise<{ id: string }> };

async function getNote(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getJournalCollection();
  return collection.findOne({ _id: new ObjectId(id) });
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
    const doc = await getNote(id);
    if (!doc) {
      return NextResponse.json(
        { ok: false, message: "Journal note not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, note: toPublicJournal(doc) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load journal note.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
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
    const existing = await getNote(id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Journal note not found." },
        { status: 404 }
      );
    }

    const fields = parseJournalInput(
      (await request.json()) as Record<string, unknown>
    );
    const collection = await getJournalCollection();
    const clash = await collection.findOne({
      slug: fields.slug,
      _id: { $ne: existing._id },
    });
    const slug = clash
      ? `${fields.slug}-${Date.now().toString(36)}`
      : fields.slug;

    const updated = await collection.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...fields, slug, updated_at: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Could not update journal note." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, note: toPublicJournal(updated) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update journal note.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await getNote(id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Journal note not found." },
        { status: 404 }
      );
    }

    const collection = await getJournalCollection();
    await collection.deleteOne({ _id: existing._id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete journal note.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
