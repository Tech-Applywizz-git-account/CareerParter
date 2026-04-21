import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  console.log("Checking roles for jobs posted on 2026-04-14:");

  const { data, error } = await supabase
    .from("job_jobrole_sponsored")
    .select("company, job_role_name, title, date_posted")
    .eq("date_posted", "2026-04-14")
    .limit(20);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Found ${data.length} jobs on 2026-04-14.`);
  data.forEach(j => console.log(` - ${j.job_role_name} | ${j.title} (${j.company})`));
}

debug();
