import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, role, country } = body as {
            email: string;
            password: string;
            role: "admin" | "lead";
            country: "United States of America" | "United Kingdom" | "Ireland"
        };

        // 1. Create Supabase user with password
        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (authError || !authData?.user) {
            return Response.json(
                { error: authError?.message || "Failed to create user" },
                { status: 400 },
            );
        }
        return Response.json({
            message: "User created successfully!",
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
