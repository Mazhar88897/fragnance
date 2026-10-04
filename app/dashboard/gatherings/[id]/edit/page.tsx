import GatheringForm from "@/components/dashboard/GatheringForm";

type EditGatheringPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGatheringPage({
  params,
}: EditGatheringPageProps) {
  const { id } = await params;
  return <GatheringForm gatheringId={id} />;
}
