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

    const countriesRaw = req.nextUrl.searchParams.get("countries") || req.nextUrl.searchParams.get("country");
    const countryList = countriesRaw
      ? countriesRaw.split(",").map(c => c.trim().toUpperCase())
      : [await getUserCountry(req)];

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    // 🚀 Get exact total count from DB
    let countQuery = supabase
      .from("jobs_all_roles")
      .select("*", { count: "exact", head: true })
      .eq("role_name", roleName)
      .in("indeed_search_country", countryList);

    if (from) countQuery = countQuery.gte("date_posted", from);
    if (to) countQuery = countQuery.lte("date_posted", to);

    const { count: exactCount } = await countQuery;

    // 🚀 Fetch the actual job rows (paginated up to 10,000)
    let dataQuery = supabase
      .from("jobs_all_roles")
      .select("company_name, role_name, title, location, date_posted, job_url_direct, indeed_search_country")
      .eq("role_name", roleName)
      .in("indeed_search_country", countryList)
      .order("date_posted", { ascending: false, nullsFirst: false })
      .limit(10000);

    if (from) dataQuery = dataQuery.gte("date_posted", from);
    if (to) dataQuery = dataQuery.lte("date_posted", to);

    const { data, error } = await dataQuery;
    if (error) throw error;

    const jobs = (data || []).map((job) => ({
      company: job.company_name,
      role: job.title,
      domain: job.role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.job_url_direct,
      website: "",
    }));

    return NextResponse.json({
      role: roleName,
      jobs,
      totalCount: exactCount ?? jobs.length,
    });
  } catch (error: any) {
    console.error("Error in /api/domain/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
