import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "./auth";

export async function withAdmin(req: NextRequest) {
  const session = withAuth(req);
  if (session instanceof NextResponse) return session; // means redirect already happened

  // Fetch role from DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}
