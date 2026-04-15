import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./../session";

export function withAuth(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? decrypt(cookie) : null;

  if (!session) {
    console.log("no session found");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // return session so admin middleware can reuse it
  return session;
}
