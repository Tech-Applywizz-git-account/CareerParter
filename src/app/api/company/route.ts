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
  
  // Check for exact matches or containing the name
  const priorityIndex = PRIORITY_COMPANIES.findIndex(p => {
    const pn = p.toLowerCase();
    return normalized === pn || normalized.startsWith(pn + " ") || normalized.endsWith(" " + pn);
  });
  
  if (priorityIndex !== -1) return -100 + priorityIndex;
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const country = req.nextUrl.searchParams.get("country") || (await getUserCountry(req));
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    // 🚀 If date filters are provided, we MUST fetch from the raw table 
    // because the view 'companies_by_sponsored_jobs' is a pre-aggregated summary
    // that doesn't respect date ranges.
    if ((from && from.trim() !== "") || (to && to.trim() !== "")) {
      return await fetchFromRawTable(country, from, to);
    }

    let allCompanies: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    // 🚀 Otherwise, fetch from view for better performance (pre-aggregated)
    while (hasMore && page < 10) { 
      const { data, error } = await supabase
        .from("companies_by_sponsored_jobs")
        .select("company, sponsored_count")
        .eq("country", country)
        .order("company", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error || !data || data.length === 0) {
        hasMore = false;
        if (error && allCompanies.length === 0) {
          return await fetchFromRawTable(country, from, to);
        }
      } else {
        allCompanies = [...allCompanies, ...data];
        hasMore = data.length === pageSize;
        page++;
      }
    }

    // 🚀 Return uniquely by name but without aggressive trimming to see if we hit 2706
    // We use a Map to ensure unique keys for React
    const companiesMap = new Map();
    allCompanies.forEach((row) => {
      if (!row.company) return;
      
      const key = row.company;
      if (!companiesMap.has(key)) {
        companiesMap.set(key, {
          company: row.company,
          sponsored_jobs: Number(row.sponsored_count) || 0,
          website: row.website || ""
        });
      } else {
        const existing = companiesMap.get(key);
        existing.sponsored_jobs += Number(row.sponsored_count) || 0;
        if (!existing.website && row.website) {
          existing.website = row.website;
        }
      }
    });

    const companies = Array.from(companiesMap.values())
      .sort((a: any, b: any) => {
        const rankA = getCompanyRank(a.company);
        const rankB = getCompanyRank(b.company);
        if (rankA !== rankB) return rankA - rankB;
        
        // Then by job count (most active first)
        const countDiff = b.sponsored_jobs - a.sponsored_jobs;
        if (countDiff !== 0) return countDiff;

        // Then alphabetically
        return a.company.localeCompare(b.company);
      });

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error("Error in /api/company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchFromRawTable(country: string, from: string | null, to: string | null) {
  let query = supabase
    .from("job_jobrole_sponsored")
    .select("company, website")
    .eq("country", country)
    .eq("sponsored_job", "Yes")
    .limit(100000);

  if (from) query = query.gte("date_posted", from);
  if (to) query = query.lte("date_posted", to);

  const { data: rawData, error: rawError } = await query;
  if (rawError) throw rawError;

  const groups = (rawData || []).reduce((acc: any, item) => {
    if (!acc[item.company]) {
      acc[item.company] = {
        company: item.company,
        sponsored_jobs: 0,
        website: item.website || ""
      };
    }
    acc[item.company].sponsored_jobs += 1;
    if (!acc[item.company].website && item.website) {
      acc[item.company].website = item.website;
    }
    return acc;
  }, {});

  const companies = Object.values(groups)
    .sort((a: any, b: any) => {
      const rankA = getCompanyRank(a.company);
      const rankB = getCompanyRank(b.company);
      if (rankA !== rankB) return rankA - rankB;
      
      const countDiff = b.sponsored_jobs - a.sponsored_jobs;
      if (countDiff !== 0) return countDiff;

      return a.company.localeCompare(b.company);
    });

  return NextResponse.json(companies);
}
