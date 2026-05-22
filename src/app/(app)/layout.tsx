import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
