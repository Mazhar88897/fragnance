import { notFound } from "next/navigation";
import GatheringArticle from "@/components/discover/GatheringArticle";
import { getPublicGatheringById } from "@/lib/gathering-server";

export const dynamic = "force-dynamic";

type GatheringPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GatheringPage({ params }: GatheringPageProps) {
  const { id } = await params;
  const gathering = await getPublicGatheringById(id);

  if (!gathering) notFound();

  return <GatheringArticle gathering={gathering} />;
}
