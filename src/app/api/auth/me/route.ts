import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ⬅️ await here
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return Response.json({ user: null }, { status: 401 });
    }

    const user = decrypt(sessionCookie);
    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user });
  } catch (err) {
    console.error("Auth check failed:", err);
    return Response.json({ user: null }, { status: 500 });
  }
}
