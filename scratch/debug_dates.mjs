import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  const roleName = "Safety Analyst";
  const country = "United States of America";

  console.log(`Checking jobs for: ${roleName} in ${country}`);

  const { data, error } = await supabase
    .from("job_jobrole_sponsored")
    .select("company, job_role_name, title, location, date_posted, country")
    .eq("job_role_name", roleName)
    .eq("country", country)
    .order("date_posted", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Found ${data.length} jobs.`);
  if (data.length > 0) {
    console.log("Latest 5 dates:");
    data.slice(0, 5).forEach(j => console.log(` - ${j.date_posted} (${j.company})`));
  } else {
    // Check if roleName is slightly different
    const { data: similar } = await supabase
      .from("job_jobrole_sponsored")
      .select("job_role_name")
      .ilike("job_role_name", `%${roleName}%`)
      .limit(10);
      
    console.log("Similar roles found (names only):", Array.from(new Set((similar || []).map(s => s.job_role_name))));
  }
  
  // Also check THE MOST RECENT jobs overall in the DB to see if 2026-04-14 exists
  console.log("\nChecking latest 5 jobs OVERALL in the DB:");
  const { data: overall } = await supabase
    .from("job_jobrole_sponsored")
    .select("company, job_role_name, date_posted, country")
    .order("date_posted", { ascending: false })
    .limit(5);
    
  (overall || []).forEach(j => console.log(` - ${j.date_posted} | ${j.job_role_name} | ${j.country} (${j.company})`));
}

debug();
