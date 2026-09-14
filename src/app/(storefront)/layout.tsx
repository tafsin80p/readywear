import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNavbar } from "@/components/MobileNavbar";
import { ClientModals } from "@/components/ClientModals";
import { Providers } from "@/components/Providers";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 bg-gray-50/50">
          {children}
        </main>
        <Footer />
        <MobileNavbar />
        <ClientModals />
      </div>
    </Providers>
  );
}
