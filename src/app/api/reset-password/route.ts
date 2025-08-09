import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { passwordResetRequestSchema } from "@/app/_types/PasswordRequest";
import { verifyPassword, hashPassword } from "@/app/_utils/password";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const result = passwordResetRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }

    const { email, secretAnswer } = result.data;

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.secretAnswer) {
      // セキュリティのため、存在しないユーザーでも同じメッセージを返す
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "秘密の質問の答えが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // 秘密の質問の答えを確認
    const isSecretAnswerValid = await verifyPassword(secretAnswer, user.secretAnswer);
    if (!isSecretAnswerValid) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "秘密の質問の答えが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // 一時的なパスワードを生成
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedTempPassword = await hashPassword(tempPassword);

    // パスワードを更新
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedTempPassword,
        // アカウントロックをリセット
        isLocked: false,
        failedLoginAttempts: 0,
        lockedAt: null,
      },
    });

    const res: ApiResponse<{ tempPassword: string }> = {
      success: true,
      payload: { tempPassword },
      message: "パスワードがリセットされました。一時的なパスワードでログインしてください。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "パスワードのリセットに失敗しました。",
    };
    return NextResponse.json(res);
  }
};
