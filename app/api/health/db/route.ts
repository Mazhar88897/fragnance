import { NextResponse } from "next/server";
import { getDb, getMongoUriDiagnostics } from "@/lib/mongodb";

export async function GET() {
  const diagnostics = getMongoUriDiagnostics();

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      database: db.databaseName,
      diagnostics,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed.";
    return NextResponse.json(
      { ok: false, message, diagnostics },
      { status: 500 }
    );
  }
}
