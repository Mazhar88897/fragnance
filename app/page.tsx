import Hero from "@/components/Hero";
import TopBar from "@/components/TopBar";
import FragranceStrip from "@/components/FragranceStrip";
import FragranceCabinet from "@/components/FragranceCabinet";
import FragranceFavourites from "@/components/FragranceFavourites";
import AddFragrance from "@/components/AddFragrance";
import FragranceNotes from "@/components/FragranceNotes";
import BottomBar from "@/components/BottomBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Hero />
      <FragranceStrip />
      <FragranceCabinet />
      <FragranceFavourites />
      <AddFragrance />
      <FragranceNotes />
      <BottomBar />
    </main>
  );
}
