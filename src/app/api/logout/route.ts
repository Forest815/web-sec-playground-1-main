import { prisma } from "@/libs/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";

// キャッシュ無効化設定（login と揃える）
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const DELETE = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("secure_auth_token")?.value;

    if (sessionId) {
      await prisma.session.deleteMany({
        where: { id: sessionId },
      });

      // クッキー削除（上書きで maxAge 0 を指定）
      cookieStore.set("secure_auth_token", "", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0, // 削除のため
        secure: process.env.NODE_ENV === "production",
      });
    }

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "ログアウトしました。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);

    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログアウトのサーバ処理でエラーが発生しました。",
    };
    return NextResponse.json(res);
  }
};
