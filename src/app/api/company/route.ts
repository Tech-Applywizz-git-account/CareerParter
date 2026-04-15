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
    const country = await getUserCountry(req);

    const { data, error } = await supabase
      .from("companies_by_sponsored_jobs")
      .select("*").eq("country", country);

    if (error) throw error;

    // Map to clean structure
    const companies = (data || []).map((row) => ({
      company: row.company,
      sponsored_jobs: row.sponsored_count,
    }));

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error("Error in /api/company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
