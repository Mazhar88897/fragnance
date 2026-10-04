import type { Metadata } from "next";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

export const metadata: Metadata = {
  title: "Dashboard — Majlis",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <DashboardTopBar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
