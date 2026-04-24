import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ⬅️ await here
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return Response.json({ user: null }, { status: 401 });
    }

    interface SessionUser {
      userId: string;
      email: string;
      fullName: string;
      role: string;
    }

    const user = decrypt<SessionUser>(sessionCookie);
    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    // Refresh role from DB to ensure it's current
    const { supabase } = await import("@/lib/supabase");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.userId)
      .single();

    if (profile) {
      user.role = profile.role;
    }

    return Response.json({ user });
  } catch (err) {
    console.error("Auth check failed:", err);
    return Response.json({ user: null }, { status: 500 });
  }
}
