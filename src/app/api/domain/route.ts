import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function isTechRole(roleName: string): boolean {
  if (!roleName) return false;
  const lower = roleName.toLowerCase();
  const techKeywords = [
    "developer", "software", "engineer", "devops", "data", "cyber",
    "security", "network", "cloud", "qa", "python", "java", "scientist",
    "servicenow", "sap", "embedded", "full stack", "game", "ai",
    "machine learning", "active directory", ".net", "computer science",
    "database", "sailpoint", "mlops", "frontend", "backend", "rtl",
  ];
  return techKeywords.some((keyword) => lower.includes(keyword));
}

export async function GET(req: NextRequest) {
  try {
    const countriesRaw = req.nextUrl.searchParams.get("countries") || req.nextUrl.searchParams.get("country");
    const countryList = countriesRaw
      ? countriesRaw.split(",").map(c => c.trim().toUpperCase())
      : [await getUserCountry(req)];

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const hasDateFilter = !!(from || to);

    // ─── Paginate through ALL rows using indeed_search_country ──────────────
    const PAGE_SIZE = 1000;
    const countsMap = new Map<string, number>();

    let page = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("jobs_all_roles")
        .select("role_name")
        .in("indeed_search_country", countryList)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (hasDateFilter) {
        if (from) query = query.gte("date_posted", from);
        if (to) query = query.lte("date_posted", to);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        data.forEach(item => {
          const role = item.role_name?.trim();
          if (role) countsMap.set(role, (countsMap.get(role) || 0) + 1);
        });
        hasMore = data.length === PAGE_SIZE;
        page++;
      }
    }

    // ─── Build final result from aggregated counts ───────────────────────────
    const result = Array.from(countsMap.entries())
      .map(([role, jobCount]) => ({
        role,
        jobCount,
        isTech: isTechRole(role),
      }))
      .filter(item => item.jobCount > 0)
      .sort((a, b) => a.role.localeCompare(b.role));

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Error in /api/domain:", error);
    return NextResponse.json([]);
  }
}
