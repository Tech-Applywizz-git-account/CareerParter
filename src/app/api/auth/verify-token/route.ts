import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  const { token } = await req.json();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "email",
  });
  if (error) {
    return Response.json(
      { error: "Invalid or expired token." },
      { status: 400 },
    );
  }

  return Response.json({ success: true });
}
