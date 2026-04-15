import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { encrypt } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid credentials" },
        { status: 401 },
      );
    }

    console.log(data);

    console.log(data.user.id);

    // Get user role
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    const role = profile?.role ?? "lead";

    const sessionData = {
      userId: data.user.id,
      email: data.user.email,
      role
    };

    // Encrypt session
    const encryptedSession = encrypt(sessionData);

    // Set cookie
    const cookie = serialize("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", cookie);

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
