import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 🧠 Helper: check if role is tech
function isTechRole(roleName: string): boolean {
  if (!roleName) return false;

  const lower = roleName.toLowerCase();
  const techKeywords = [
    "developer",
    "software",
    "engineer",
    "devops",
    "data",
    "cyber",
    "security",
    "network",
    "cloud",
    "qa",
    "python",
    "java",
    "scientist",
    "servicenow",
    "sap",
    "embedded",
    "full stack",
    "game",
    "ai",
    "machine learning",
    "active directory",
    ".net",
    "computer science",
    "database",
    "sailpoint",
  ];

  return techKeywords.some((keyword) => lower.includes(keyword));
}

export async function GET(req: NextRequest) {
  try {
    const country =
      req.nextUrl.searchParams.get("country") || (await getUserCountry(req));
    // 1️⃣ Fetch all unique job roles
    const { data, error } = await supabase
      .from("unique_job_role_names")
      .select("job_role_name").eq("country", country);

    if (error) throw error;

    // 2️⃣ Map each role with isTech + deduplicate by role name
    const seen = new Map<string, { role: string; isTech: boolean }>();
    for (const item of data || []) {
      const role = item.job_role_name.trim();
      if (!seen.has(role)) {
        seen.set(role, { role, isTech: isTechRole(role) });
      }
    }
    const result = Array.from(seen.values());

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/domain:", error);
    // Return empty array so frontend always receives an array
    return NextResponse.json([]);
  }
}
