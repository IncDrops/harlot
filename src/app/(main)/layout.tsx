import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { MessageProvider } from "@/contexts/message-context";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MessageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <BottomNav />
      </div>
    </MessageProvider>
  );
}
