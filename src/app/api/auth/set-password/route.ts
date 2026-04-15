import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  const { token, refreshToken, password } = await req.json();

  // Set session with both access token and refresh token
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: token, // access token
    refresh_token: refreshToken, // refresh token
  });

  if (sessionError) {
    return Response.json(
      { error: "Failed to authenticate user." },
      { status: 401 },
    );
  }

  // Now update the user's password
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return Response.json(
      { error: "Failed to update password." },
      { status: 400 },
    );
  }

  return Response.json({ message: "Password updated successfully!" });
}
