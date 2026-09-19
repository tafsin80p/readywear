import Script from "next/script";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";

export default async function GoogleAnalytics() {
  try {
    await connectToDatabase();
    // In production, might want to cache this using unstable_cache or similar
    const settings = await IntegrationSettings.findOne().lean();
    const ga = settings?.googleAnalytics;
    
    if (!ga?.enabled || !ga?.measurementId) {
      return null;
    }
    
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${ga.measurementId}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga.measurementId}');
          `}
        </Script>
      </>
    );
  } catch (error) {
    console.error("Failed to load Google Analytics settings", error);
    return null;
  }
}
