import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { CollectionSection } from "@/components/CollectionSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 bg-gray-50/30">
        
        <div className="pt-2 pb-8 md:py-8 bg-gray-50/50">
          <CollectionSection />
        </div>
        
      </main>

      <Footer />
    </>
  );
}
