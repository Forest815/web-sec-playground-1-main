import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { verifySession } from "@/app/api/_helper/verifySession";
import { passwordChangeRequestSchema } from "@/app/_types/PasswordRequest";
import { verifyPassword, hashPassword } from "@/app/_utils/password";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const userId = await verifySession();
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証が必要です。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    const result = passwordChangeRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }

    const { currentPassword, newPassword } = result.data;

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザーが見つかりません。",
      };
      return NextResponse.json(res, { status: 404 });
    }

    // 現在のパスワードを確認
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "現在のパスワードが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // 新しいパスワードをハッシュ化
    const hashedNewPassword = await hashPassword(newPassword);

    // パスワードを更新
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "パスワードが正常に変更されました。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "パスワードの変更に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
