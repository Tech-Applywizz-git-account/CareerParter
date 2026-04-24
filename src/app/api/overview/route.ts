import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    const countriesRaw = req.nextUrl.searchParams.get("countries") || req.nextUrl.searchParams.get("country");
    const countryList = countriesRaw
      ? countriesRaw.split(",").map(c => c.trim().toUpperCase())
      : [await getUserCountry(req)];

    // 1️⃣ Total Jobs count
    const { count: total_companies, error: totalError } = await supabase
      .from("jobs_all_roles")
      .select("*", { count: "exact", head: true })
      .in("indeed_search_country", countryList);
    if (totalError) throw totalError;

    // 2️⃣ Total unique Domains (role_name)
    const { data: domainData, error: domainError } = await supabase
      .from("jobs_all_roles")
      .select("role_name")
      .in("indeed_search_country", countryList);
    if (domainError) throw domainError;
    const total_domains = new Set(domainData?.map(d => d.role_name).filter(Boolean)).size;

    // 3️⃣ Jobs posted in last 7 days
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const formattedLastWeekStart = lastWeekStart.toISOString().split("T")[0];

    const { count: sponsorship_companies, error: sponsorshipError } = await supabase
      .from("jobs_all_roles")
      .select("*", { count: "exact", head: true })
      .in("indeed_search_country", countryList)
      .gte("date_posted", formattedLastWeekStart);
    if (sponsorshipError) throw sponsorshipError;

    // 4️⃣ Latest 10 Jobs
    const { data: latestJobsData, error: latestJobsError } = await supabase
      .from("jobs_all_roles")
      .select("company_name, role_name, title, location, date_posted, job_url_direct")
      .in("indeed_search_country", countryList)
      .order("date_posted", { ascending: false, nullsFirst: false })
      .limit(10);
    if (latestJobsError) throw latestJobsError;

    const latest_jobs = (latestJobsData || []).map((job) => ({
      company: job.company_name || "Unknown Company",
      role: job.title || "Unknown Role",
      domain: job.role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.job_url_direct,
    }));

    // 5️⃣ Top Companies — paginate to avoid 1000 row cap
    const PAGE_SIZE = 1000;
    const companyCounts: Record<string, number> = {};
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: pageData, error: pageError } = await supabase
        .from("jobs_all_roles")
        .select("company_name")
        .in("indeed_search_country", countryList)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (pageError) throw pageError;

      if (!pageData || pageData.length === 0) {
        hasMore = false;
      } else {
        pageData.forEach(row => {
          const name = row.company_name?.trim();
          if (name) companyCounts[name] = (companyCounts[name] || 0) + 1;
        });
        hasMore = pageData.length === PAGE_SIZE;
        page++;
      }
    }

    const top_companies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, sponsored_count: count }))
      .sort((a, b) => b.sponsored_count - a.sponsored_count)
      .slice(0, 10);

    return NextResponse.json({
      total_companies: total_companies ?? 0,
      total_domains,
      sponsorship_companies: sponsorship_companies ?? 0,
      latest_jobs,
      top_companies,
    });
  } catch (error: any) {
    console.error("Error in /api/overview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
