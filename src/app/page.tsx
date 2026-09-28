import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { PromoMarquee } from "@/components/PromoMarquee";
import { CollectionSection } from "@/components/CollectionSection";
import { PromoBannerGroup } from "@/components/PromoBannerGroup";
import { ServiceFeatures } from "@/components/ServiceFeatures";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 bg-gray-50/30">
        <HeroSlider />
        <PromoMarquee />
        
        <div className="py-8 bg-gray-50/50">
          <CollectionSection />
        </div>
        
        <PromoBannerGroup />
        <ServiceFeatures />
      </main>

      <Footer />
    </>
  );
}
