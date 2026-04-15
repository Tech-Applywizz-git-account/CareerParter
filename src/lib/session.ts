import crypto from "crypto";
import { NextRequest } from "next/server";

import { createClient } from "@supabase/supabase-js";

const ALGORITHM = "aes-256-gcm";
const SECRET = process.env.SESSION_SECRET || "dev-secret-key-32byteslong!";
const KEY = crypto.createHash("sha256").update(SECRET).digest(); // ✅ always 32 bytes
const IV_LENGTH = 16;

export function encrypt(data: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const json = JSON.stringify(data);
  let encrypted = cipher.update(json, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export async function getUserCountry(req: NextRequest) {
  const encryptedSession = req.cookies.get("session")?.value;
  if (!encryptedSession) throw new Error("No session found");

  const val = decrypt(encryptedSession);
  if (!val?.userId) throw new Error("Invalid session payload");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side use only
  );

  const { data, error } = await supabase
    .from("users")
    .select("country")
    .eq("user_id", val.userId)
    .maybeSingle();

  if (error) console.error("Error fetching user country:", error);

  return data?.country ?? "United States of America";
}

export function decrypt(encryptedData: string): any | null {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Failed to decrypt session:", err);
    return null;
  }
}
