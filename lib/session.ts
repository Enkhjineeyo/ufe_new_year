import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "./auth";

/** Нэвтэрсэн оюутны майлыг буцаана (нэвтрээгүй бол null) */
export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value, "session")?.email ?? null;
}
