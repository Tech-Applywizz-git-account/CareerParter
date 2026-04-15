import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, country } = body as { email: string; role: "admin" | "lead"; country: "United States of America" | "United Kingdom" | "Ireland" };

    // 1. Create Supabase user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
      });

    if (authError || !authData?.user) {
      return Response.json(
        { error: authError?.message || "Failed to create user" },
        { status: 400 },
      );
    }

    // 2. Send invite email
    const { error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo:
          "https://www.sponsored-jobs-one.vercel.app/auth/set-password",
      });

    if (inviteError) {
      console.log(inviteError);
      return Response.json({ error: inviteError.message }, { status: 400 });
    }

    // 3. Insert into custom users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert([{ user_id: authData.user.id, email, role, country }]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 });
    }

    return Response.json({
      message: "User created successfully! Invite email sent.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}