const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tbfcxawbygftalalhvlf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZmN4YXdieWdmdGFsYWxodmxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1MDU2NywiZXhwIjoyMDkxODI2NTY3fQ.iJUbjt_MytZK_rnSfZgP6xkRJIajwzAsTwv1adZUu3w'
);

async function check() {
  const country = 'United States of America';
  const { data: view } = await supabase.from('domains_with_counts').select('role, job_count').eq('country', country).limit(5);
  
  if (!view) {
    console.log('View not found or empty');
    return;
  }

  for (const v of view) {
    const { count } = await supabase.from('job_jobrole_sponsored').select('*', { count: 'exact', head: true }).eq('country', country).eq('job_role_name', v.role);
    console.log(`Role: ${v.role.padEnd(20)} | View: ${v.job_count.toString().padEnd(6)} | Actual: ${count}`);
  }
}

check();
