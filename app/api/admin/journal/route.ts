import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";
import { parseJournalInput, toPublicJournal } from "@/lib/journal-posts";
import { getJournalCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Admin sign in required." },
        { status: 401 }
      );
    }

    const collection = await getJournalCollection();
    const docs = await collection.find({}).sort({ created_at: -1 }).toArray();

    return NextResponse.json({
      ok: true,
      notes: docs.map(toPublicJournal),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load journal.";
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

    const fields = parseJournalInput(
      (await request.json()) as Record<string, unknown>
    );
    const collection = await getJournalCollection();
    const existing = await collection.findOne({ slug: fields.slug });
    const slug = existing
      ? `${fields.slug}-${Date.now().toString(36)}`
      : fields.slug;
    const now = new Date();
    const doc = {
      ...fields,
      slug,
      created_at: now,
      updated_at: now,
    };
    const result = await collection.insertOne(doc);

    return NextResponse.json({
      ok: true,
      note: toPublicJournal({ ...doc, _id: result.insertedId }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save journal note.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
