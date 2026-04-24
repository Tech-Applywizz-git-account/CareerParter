import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PRIORITY_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Adobe",
  "Salesforce", "Oracle", "IBM", "Nvidia", "Uber", "Airbnb", "LinkedIn",
  "Twitter", "Tesla", "Intel", "Cisco", "AMD", "Shopify"
];

function getCompanyRank(name: string): number {
  if (!name) return 0;
  const normalized = name.toLowerCase().trim();
  const priorityIndex = PRIORITY_COMPANIES.findIndex(p => {
    const pn = p.toLowerCase();
    return normalized === pn || normalized.startsWith(pn + " ") || normalized.endsWith(" " + pn);
  });
  if (priorityIndex !== -1) return -100 + priorityIndex;
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const countriesRaw = req.nextUrl.searchParams.get("countries") || req.nextUrl.searchParams.get("country");
    const countryList = countriesRaw
      ? countriesRaw.split(",").map(c => c.trim().toUpperCase())
      : [await getUserCountry(req)];

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    // Paginate through all rows to avoid the 1000-row Supabase default cap
    const PAGE_SIZE = 1000;
    const groups: Record<string, number> = {};

    let page = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("jobs_all_roles")
        .select("company_name")
        .in("indeed_search_country", countryList)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (from && from.trim() !== "") query = query.gte("date_posted", from);
      if (to && to.trim() !== "") query = query.lte("date_posted", to);

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        data.forEach(item => {
          const name = item.company_name?.trim();
          if (name) groups[name] = (groups[name] || 0) + 1;
        });
        hasMore = data.length === PAGE_SIZE;
        page++;
      }
    }

    const companies = Object.entries(groups)
      .map(([company, sponsored_jobs]) => ({ company, sponsored_jobs, website: "" }))
      .sort((a: any, b: any) => {
        const rankA = getCompanyRank(a.company);
        const rankB = getCompanyRank(b.company);
        if (rankA !== rankB) return rankA - rankB;
        const countDiff = b.sponsored_jobs - a.sponsored_jobs;
        if (countDiff !== 0) return countDiff;
        return a.company.localeCompare(b.company);
      });

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error("Error in /api/company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
