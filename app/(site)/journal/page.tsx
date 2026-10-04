import JournalView from "@/components/journal/JournalView";
import { listPublicJournals } from "@/lib/journal-server";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const notes = await listPublicJournals();
  return <JournalView notes={notes} />;
}
