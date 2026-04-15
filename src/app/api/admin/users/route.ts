import { createClient } from "@supabase/supabase-js";
import { withAdmin } from "@/lib/middleware/admin";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const sessionResponse = await withAdmin(req);
    
    // If sessionResponse is a Response object, it means there was an error
    if (sessionResponse instanceof Response) {
      return sessionResponse;
    }

    // If we get here, sessionResponse contains the session data
    // Fetch all users from the custom users table
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .filter("role", "eq", "lead")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}