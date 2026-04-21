import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { encrypt } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "Could not sign up" },
        { status: 400 },
      );
    }

    // Default role for new signups
    const role = "lead";

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
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
