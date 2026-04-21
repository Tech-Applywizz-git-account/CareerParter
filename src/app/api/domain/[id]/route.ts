import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const roleName = decodeURIComponent(id);

    const country = req.nextUrl.searchParams.get("country") || (await getUserCountry(req));
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    // 🚀 Get exact total count from DB (no row limit applied)
    let countQuery = supabase
      .from("job_jobrole_sponsored")
      .select("*", { count: "exact", head: true })
      .eq("job_role_name", roleName)
      .eq("country", country);

    if (from) countQuery = countQuery.gte("date_posted", from);
    if (to) countQuery = countQuery.lte("date_posted", to);

    const { count: exactCount } = await countQuery;

    // 🚀 Also fetch the actual job rows for display (paginated to 10,000)
    let dataQuery = supabase
      .from("job_jobrole_sponsored")
      .select("company, job_role_name, title, location, date_posted, url, website")
      .eq("job_role_name", roleName)
      .eq("country", country)
      .order("date_posted", { ascending: false, nullsFirst: false })
      .limit(10000);

    if (from) dataQuery = dataQuery.gte("date_posted", from);
    if (to) dataQuery = dataQuery.lte("date_posted", to);

    const { data, error } = await dataQuery;
    if (error) throw error;

    const markersToIgnore = getMismatchedMarkers(country);
    
    const jobs = (data || [])
      .filter(job => {
        const loc = (job.location || "").toLowerCase();
        return !markersToIgnore.some(marker => loc.includes(marker));
      })
      .map((job) => ({
        company: job.company,
        role: job.title,
        domain: job.job_role_name,
        location: job.location,
        posted: job.date_posted,
        link: job.url,
        website: job.website || "",
      }));

    // 🚀 Return both the exact count and the job rows
    return NextResponse.json({ 
      role: roleName, 
      jobs,
      totalCount: exactCount ?? jobs.length  // exact DB count always preferred
    });
  } catch (error: any) {
    console.error("Error in /api/domain/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getMismatchedMarkers(selectedCountryValue: string): string[] {
  const map: Record<string, string[]> = {
    "United States of America": ["united kingdom", "london", "manchester", "ireland", "dublin", "canada", "toronto"],
    "United Kingdom": ["united states", "usa", "america", "california", "texas", "ny", "canada"],
    "Ireland": ["united states", "usa", "america", "london", "uk", "canada"],
    "Canada": ["united states", "usa", "america", "uk", "london", "ireland"]
  };
  return map[selectedCountryValue] || [];
}
