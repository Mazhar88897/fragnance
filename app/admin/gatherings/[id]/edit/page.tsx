import GatheringForm from "@/components/dashboard/GatheringForm";

type AdminEditGatheringPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditGatheringPage({
  params,
}: AdminEditGatheringPageProps) {
  const { id } = await params;
  return <GatheringForm gatheringId={id} asAdmin />;
}
