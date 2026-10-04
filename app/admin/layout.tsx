import type { Metadata } from "next";
import AdminTopBar from "@/components/AdminTopBar";

export const metadata: Metadata = {
  title: "Majlis Admin",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminTopBar />
      {children}
    </>
  );
}
