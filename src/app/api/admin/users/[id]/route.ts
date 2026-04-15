import { createClient } from "@supabase/supabase-js";
import { withAdmin } from "@/lib/middleware/admin";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    const sessionResponse = await withAdmin(req);

    // If sessionResponse is a Response object, it means there was an error
    if (sessionResponse instanceof Response) {
      return sessionResponse;
    }

    // Await the params to resolve the dynamic route parameter
    const { id } = await params;

    const { status } = await req.json();

    // Validate input
    if (typeof status !== 'boolean') {
      return Response.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update user status
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ status })
      .eq("user_id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user status:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error updating user status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    const sessionResponse = await withAdmin(req);

    // If sessionResponse is a Response object, it means there was an error
    if (sessionResponse instanceof Response) {
      return sessionResponse;
    }

    // Await the params to resolve the dynamic route parameter
    const { id } = await params;

    // 1. Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Error deleting user from auth:", authError);
      return Response.json({ error: authError.message }, { status: 400 });
    }

    // 2. Delete from public users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("user_id", id);

    if (dbError) {
      console.error("Error deleting user from db:", dbError);
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}