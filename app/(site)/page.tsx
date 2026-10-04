import DiscoverView from "@/components/discover/DiscoverView";
import { listPublicGatherings } from "@/lib/gathering-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const gatherings = await listPublicGatherings();
  return <DiscoverView gatherings={gatherings} />;
}
