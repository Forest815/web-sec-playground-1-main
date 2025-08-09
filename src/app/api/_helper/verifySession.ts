import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";
import { AUTH_CONFIG } from "@/config/auth";

/**
 * Cookie の sessionId から userId を取得（期限延長あり）
 * 無効な場合は DB の Session レコードも、Cookie も削除する
 */
export const verifySession = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("secure_auth_token")?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  const now = new Date();
  if (!session || session.expiresAt <= now) {
    // 無効なセッションは削除
    await prisma.session.deleteMany({ where: { id: sessionId } });
    cookieStore.set("secure_auth_token", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });
    return null;
  }

  // セッションの有効期限を延長
  const tokenMaxAgeSeconds = AUTH_CONFIG.SESSION_DURATION_HOURS * 60 * 60;
  const newExpiry = new Date(now.getTime() + tokenMaxAgeSeconds * 1000);
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiry },
  });

  cookieStore.set("secure_auth_token", sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: tokenMaxAgeSeconds,
    secure: process.env.NODE_ENV === "production",
  });

  return session.userId;
};
