import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our jobs_all_roles table
export interface JobData {
  id: number;
  role_id: number | null;
  role_name: string | null;
  indeed_search_country: string | null;
  country: string | null;
  location: string | null;
  title: string | null;
  company_name: string | null;
  job_url: string | null;
  job_url_direct: string | null;
  date_posted: string | null;
  is_remote: boolean | null;
  description: string | null;
  created_at: string;
}

export interface DatabaseStats {
  totalJobs: number;
  sponsoredJobs: number;
  nonSponsoredJobs: number;
  doesNotMention: number;
  uniqueCompanies: number;
  uniqueRoles: number;
  uniqueLocations: number;
  topCompanies: Array<{ company: string; count: number }>;
  topRoles: Array<{ job_role_name: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

// Authentication types
export interface UserRole {
  id: string;
  email: string;
  role: "admin" | "lead" | "user";
}

export interface AuthUser extends User {
  role?: "admin" | "lead" | "user";
}

// Role checking functions
