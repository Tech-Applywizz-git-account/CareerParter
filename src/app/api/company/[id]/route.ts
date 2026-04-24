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
    const companyName = decodeURIComponent(id);

    const countriesRaw = req.nextUrl.searchParams.get("countries") || req.nextUrl.searchParams.get("country");
    const countryList = countriesRaw
      ? countriesRaw.split(",").map(c => c.trim().toUpperCase())
      : [await getUserCountry(req)];

    const { data, error } = await supabase
      .from("jobs_all_roles")
      .select("company_name, role_name, title, location, date_posted, job_url_direct")
      .eq("company_name", companyName)
      .in("indeed_search_country", countryList)
      .order("date_posted", { ascending: false, nullsFirst: false });

    if (error) throw error;

    const jobs = (data || []).map((job) => ({
      company: job.company_name,
      role: job.title,
      domain: job.role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.job_url_direct,
    }));

    return NextResponse.json({ company: companyName, jobs });
  } catch (error: unknown) {
    console.error("Error in /api/company/[id]:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
