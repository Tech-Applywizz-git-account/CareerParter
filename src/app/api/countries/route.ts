import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    // Fetch unique countries that actually have jobs
    const { data, error } = await supabase
      .from("job_jobrole_sponsored")
      .select("country")
      .not("country", "is", null);

    if (error) throw error;

    // Deduplicate and format
    const uniqueCountries = Array.from(new Set(data.map(item => item.country)));
    
    return NextResponse.json(uniqueCountries);
  } catch (error: any) {
    console.error("Error in /api/countries:", error);
    return NextResponse.json([], { status: 500 });
  }
}
