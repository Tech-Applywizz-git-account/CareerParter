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
    "database", "sailpoint",
  ];
  return techKeywords.some((keyword) => lower.includes(keyword));
}

function isCorrectCountryForRole(roleName: string, selectedCountryValue: string): boolean {
  if (!roleName) return true;
  const lower = roleName.toLowerCase().trim();
  const countriesToIgnore = ["uk", "united kingdom", "ireland", "canada", "germany", "deutschland", "europe", "australia", "uae", "india", "japan"];
  
  const shouldIgnore = countriesToIgnore.some(country => {
    if (selectedCountryValue.toLowerCase().includes(country)) return false;
    const regex = new RegExp(`\\b${country}\\b`, "i");
    return regex.test(lower);
  });
  if (shouldIgnore) return false;

  if (lower.includes("for ")) {
    const parts = lower.split("for ");
    const mentioned = parts[parts.length - 1].trim();
    const currentCountryNormal = selectedCountryValue.toLowerCase();
    const foreignMarkers = ["uk", "ie", "ca", "in", "jp", "canada", "germany", "ireland", "united kingdom", "deutschland"];
    if (foreignMarkers.includes(mentioned) && !currentCountryNormal.includes(mentioned)) {
      return false;
    }
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const country = req.nextUrl.searchParams.get("country") || (await getUserCountry(req));
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    const hasDateFilter = !!(from || to);

    // ─── Step 1: Get all unique role names for this country ─────────────────
    const { data: roleNames, error: roleError } = await supabase
      .from("unique_job_role_names")
      .select("job_role_name")
      .eq("country", country)
      .limit(3000);

    if (roleError) throw roleError;

    const filteredRoles = (roleNames || [])
      .map(r => r.job_role_name)
      .filter(role => isCorrectCountryForRole(role, country));

    // ─── Step 2: For each role, get EXACT count from the DB ─────────────────
    // We batch-fetch counts using a single raw groupby query instead of N queries.
    // This uses the domains_with_counts view for all-time, or raw table for date ranges.

    let countsMap = new Map<string, number>();

    if (!hasDateFilter) {
      // Use the pre-computed view — absolutely accurate for all-time counts
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore && page < 20) {
        const { data, error } = await supabase
          .from("domains_with_counts")
          .select("role, job_count")
          .eq("country", country)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) {
          hasMore = false;
        } else {
          data.forEach(item => {
            // Use EXACT casing from DB, no normalization
            countsMap.set(item.role, Number(item.job_count) || 0);
          });
          hasMore = data.length === pageSize;
          page++;
        }
      }
    } else {
      // For date ranges: count by scanning raw table, grouped in-memory
      const { data: rawData } = await supabase
        .from("job_jobrole_sponsored")
        .select("job_role_name")
        .eq("country", country)
        .gte("date_posted", from || '2000-01-01')
        .lte("date_posted", to || '2100-01-01')
        .limit(500000); // generous limit

      if (rawData) {
        rawData.forEach(item => {
          const role = item.job_role_name;
          if (role) countsMap.set(role, (countsMap.get(role) || 0) + 1);
        });
      }
    }

    // ─── Step 3: Build final result ─────────────────────────────────────────
    // Try exact match first, then case-insensitive fallback
    const result = filteredRoles.map(role => {
      let jobCount = countsMap.get(role) ?? 0;

      // Case-insensitive fallback if exact match returned 0
      if (jobCount === 0) {
        const lower = role.toLowerCase();
        for (const [key, val] of countsMap.entries()) {
          if (key.toLowerCase() === lower) {
            jobCount = val;
            break;
          }
        }
      }

      return { role, jobCount, isTech: isTechRole(role) };
    });

    // For date filters: only show domains that actually have jobs in that period
    const finalResult = hasDateFilter
      ? result.filter(item => item.jobCount > 0)
      : result;

    finalResult.sort((a, b) => a.role.localeCompare(b.role));

    return NextResponse.json(finalResult);

  } catch (error: any) {
    console.error("Error in /api/domain:", error);
    return NextResponse.json([]);
  }
}
