
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const country = 'United States of America';
  
  // 1. Get summary counts
  const res = await fetch(`http://localhost:3000/api/domain?country=${encodeURIComponent(country)}`);
  const summary = await res.json();
  
  // Pick 3 roles to verify
  const testRoles = summary.slice(0, 3);
  
  for (const role of testRoles) {
    const detailRes = await fetch(`http://localhost:3000/api/domain/${encodeURIComponent(role.role)}?country=${encodeURIComponent(country)}`);
    const details = await detailRes.json();
    console.log(`Role: ${role.role} | Summary Count: ${role.jobCount} | Details Count: ${details.jobs.length}`);
  }
}

check();
