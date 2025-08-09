import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";

/**
 * セッションを新規作成して Cookie に設定する。
 * @param userId - ユーザのID (UUID)
 * @param tokenMaxAgeSeconds - 有効期限（秒単位）
 * @param ipAddress - IPアドレス（オプション）
 * @param userAgent - ユーザーエージェント（オプション）
 * @returns - SessionID
 */
export const createSession = async (
  userId: string,
  tokenMaxAgeSeconds: number,
  ipAddress?: string,
  userAgent?: string,
): Promise<string> => {
  // 当該ユーザの古いセッションを削除（セキュリティ向上）
  await prisma.session.deleteMany({ where: { userId: userId } });

  const session = await prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + tokenMaxAgeSeconds * 1000),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  const cookieStore = await cookies();
  // より予測しにくいセッション名を使用
  cookieStore.set("secure_auth_token", session.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: tokenMaxAgeSeconds,
    secure: process.env.NODE_ENV === "production", // プロダクションでのみHTTPS必須
  });

  return session.id;
};
