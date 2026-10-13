import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNavbar } from "@/components/MobileNavbar";
import { ClientModals } from "@/components/ClientModals";
import { FloatingSocialButtons } from "@/components/FloatingSocialButtons";
import { Providers } from "@/components/Providers";
import connectToDatabase from "@/lib/mongodb";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerLogo = "";
  let footerLogo = "";
  let socialLinks: any = {};
  let offerSettings: any = null;

  try {
    const StoreSettings = (await import("@/models/StoreSettings")).default;
    await connectToDatabase();
    const settings: any = await StoreSettings.findOne().lean();
    if (settings) {
      headerLogo = settings.headerLogo || "";
      footerLogo = settings.footerLogo || "";
      socialLinks = {
        facebook: settings.facebookUrl || "",
        instagram: settings.instagramUrl || "",
        youtube: settings.youtubeUrl || "",
        whatsapp: settings.whatsappUrl || "",
        messenger: settings.messengerUrl || "",
      };
      offerSettings = {
        enabled: Boolean(settings.offerBarEnabled),
        title: settings.offerBarTitle || "পূজার সেল অফার!",
        subtitle: settings.offerBarSubtitle || "অফার চলবে ৩ দিন — সমস্ত কালেকশনে আকর্ষণীয় ছাড়",
        badgeText: settings.offerBarBadgeText || "পূজা স্পেশাল",
        endDate: settings.offerBarEndDate || "",
        buttonText: settings.offerBarButtonText || "অফার দেখুন",
        buttonLink: settings.offerBarButtonLink || "/categories",
        bgGradient: settings.offerBarBgGradient || "bg-primary",
        autoFallback: settings.offerBarAutoFallbackOnExpire !== false,
      };
    }
  } catch (error) {
    console.error("Failed to fetch store settings for logos", error);
  }

  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar offerSettings={offerSettings} />
        <Header logoUrl={headerLogo} />
        <main className="flex-1 bg-gray-50/50">
          {children}
        </main>
        <Footer logoUrl={footerLogo || headerLogo} socialLinks={socialLinks} />
        <MobileNavbar />
        <ClientModals logoUrl={headerLogo} />
        <FloatingSocialButtons whatsappUrl={socialLinks.whatsapp} messengerUrl={socialLinks.messenger} />
      </div>
    </Providers>
  );
}
