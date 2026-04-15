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
    // 1️⃣ Decode the role name from the URL
    const { id } = await context.params; // ⬅️ await it here
    const roleName = decodeURIComponent(id);

    const country =
      req.nextUrl.searchParams.get("country") || (await getUserCountry(req));

    // 2️⃣ Query all jobs for this role
    const { data, error } = await supabase
      .from("job_jobrole_sponsored")
      .select("company, job_role_name, title, location, date_posted, url")
      .eq("job_role_name", roleName)
      .eq("country", country)
      .order("date_posted", { ascending: false, nullsFirst: false });

    if (error) throw error;

    // 3️⃣ Format response
    const jobs = (data || []).map((job) => ({
      company: job.company,
      role: job.title,
      domain: job.job_role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.url,
    }));

    return NextResponse.json({ role: roleName, jobs });
  } catch (error: any) {
    console.error("Error in /api/domain/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
