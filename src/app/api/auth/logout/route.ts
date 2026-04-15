// src/app/api/auth/logout/route.ts
import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // expire immediately
    path: "/",
  });

  return new Response(null, {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
