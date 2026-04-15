import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic"; // ensure fresh data on each request

// ✅ Initialize Supabase server client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role key required for head+count queries
);

export async function GET(req: NextRequest) {
  try {

    const country = await getUserCountry(req);

    // 1️⃣ Total Companies (total rows)
    const { count: total_companies, error: totalCompaniesError } =
      await supabase
        .from("job_jobrole_sponsored")
        .select("*", { count: "exact", head: true }).eq("country", country);

    if (totalCompaniesError) throw totalCompaniesError;

    // 2️⃣ Total Domains (unique job_role_name) — using the view `unique_job_role_names`
    const { count: total_domains, error: totalDomainsError } = await supabase
      .from("unique_job_role_names")
      .select("*", { count: "exact", head: true }).eq("country", country);

    if (totalDomainsError) throw totalDomainsError;

    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    const formattedLastWeekStart = lastWeekStart.toISOString().split("T")[0];

    // 3️⃣ Sponsorship Companies Count (where sponsored_job = 'Yes')
    const { count: sponsorship_companies, error: sponsorshipError } =
      await supabase
        .from("job_jobrole_sponsored")
        .select("*", { count: "exact", head: true })
        .eq("sponsored_job", "Yes")
        .gte("date_posted", formattedLastWeekStart);
    if (sponsorshipError) throw sponsorshipError;

    // 4️⃣ Latest Jobs (top 10 by date_posted desc)
    const { data: latestJobsData, error: latestJobsError } = await supabase
      .from("job_jobrole_sponsored")
      .select("company, job_role_name, title, location, date_posted, url").eq("country", country)
      .order("date_posted", { ascending: false, nullsFirst: false })
      .limit(10);

    if (latestJobsError) throw latestJobsError;

    const latest_jobs = (latestJobsData || []).map((job) => ({
      company: job.company,
      role: job.title,
      domain: job.job_role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.url,
    }));
    // 5️⃣ Top Companies (from the view top_10_companies_by_sponsored_jobs)

    const { data: top_companies, error: topCompaniesError } = await supabase
      .from("companies_by_sponsored_jobs")
      .select("*").eq("country", country)
      .order("sponsored_count", { ascending: false })
      .limit(10);

    if (topCompaniesError) throw topCompaniesError;

    // ✅ Final Response
    return NextResponse.json({
      total_companies: total_companies ?? 0,
      total_domains: total_domains ?? 0,
      sponsorship_companies: sponsorship_companies ?? 0,
      latest_jobs,
      top_companies,
    });
  } catch (error: any) {
    console.error("Error in /api/overview route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
