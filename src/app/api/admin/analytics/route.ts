import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import IntegrationSettings from "@/models/IntegrationSettings";
import connectToDatabase from "@/lib/mongodb";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await IntegrationSettings.findOne();

    // Prefer DB settings, fallback to .env
    const clientEmail = settings?.googleAnalytics?.clientEmail || process.env.GA_CLIENT_EMAIL;
    // Replace literal '\n' string from env/db with actual newlines
    let privateKeyRaw = settings?.googleAnalytics?.privateKey || process.env.GA_PRIVATE_KEY;
    const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');
    const propertyId = settings?.googleAnalytics?.propertyId || process.env.GA_PROPERTY_ID;

    // Check if credentials are provided
    if (!clientEmail || !privateKey || !propertyId) {
      return NextResponse.json({ setupRequired: true });
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "7daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [
        {
          name: "date",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
        {
          name: "screenPageViews",
        },
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: "date",
          },
        },
      ],
    });

    const formattedData = response.rows?.map((row) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      // Format date from YYYYMMDD to readable
      let formattedDate = dateStr;
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const dateObj = new Date(`${year}-${month}-${day}`);
        formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      return {
        date: formattedDate,
        visitors: parseInt(row.metricValues?.[0]?.value || "0"),
        pageviews: parseInt(row.metricValues?.[1]?.value || "0"),
      };
    }) || [];

    // Calculate totals
    const totalVisitors = formattedData.reduce((sum, item) => sum + item.visitors, 0);
    const totalPageviews = formattedData.reduce((sum, item) => sum + item.pageviews, 0);

    // Fetch Realtime Data (Active users right now)
    let liveUsers = 0;
    try {
      const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [
          {
            name: "activeUsers",
          },
        ],
      });
      liveUsers = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0");
    } catch (e) {
      console.log("Realtime report error:", e);
    }

    return NextResponse.json({
      success: true,
      setupRequired: false,
      data: {
        chartData: formattedData,
        liveUsers: liveUsers,
        totals: {
          visitors: totalVisitors,
          pageviews: totalPageviews
        }
      }
    });

  } catch (error: any) {
    console.error("Google Analytics API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
