import SiteFooter from "@/components/SiteFooter";
import TopBar from "@/components/TopBar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <TopBar />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
