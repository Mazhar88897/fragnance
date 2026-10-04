import AdminJournalForm from "@/components/admin/AdminJournalForm";

type EditJournalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditJournalPage({
  params,
}: EditJournalPageProps) {
  const { id } = await params;
  return <AdminJournalForm noteId={id} />;
}
