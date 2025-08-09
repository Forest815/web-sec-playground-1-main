import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/app/api/_helper/createSession";
import { AUTH, AUTH_CONFIG } from "@/config/auth";
import { verifyPassword } from "@/app/_utils/password";
import { checkLoginRateLimit, isIpBlocked, resetLoginAttempts } from "@/app/_utils/rateLimit";

// キャッシュを無効化して毎回最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // IP制限チェック
    if (isIpBlocked(clientIp)) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このIPアドレスは一時的にブロックされています。後でもう一度お試しください。",
      };
      return NextResponse.json(res, { status: 429 });
    }

    // レート制限チェック
    if (!checkLoginRateLimit(clientIp)) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ログイン試行回数が上限に達しました。しばらく待ってからお試しください。",
      };
      return NextResponse.json(res, { status: 429 });
    }

    const result = loginRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    // ログイン履歴を記録
    const recordLoginHistory = async (success: boolean) => {
      if (user) {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: clientIp,
            userAgent: userAgent,
            success: success,
          },
        });
      }
    };

    if (!user) {
      await recordLoginHistory(false);
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // アカウントロックチェック
    if (user.isLocked) {
      const now = new Date();
      const lockExpiry = user.lockedAt ? new Date(user.lockedAt.getTime() + AUTH_CONFIG.LOCK_DURATION_MINUTES * 60 * 1000) : now;
      
      if (now < lockExpiry) {
        await recordLoginHistory(false);
        const res: ApiResponse<null> = {
          success: false,
          payload: null,
          message: "アカウントがロックされています。しばらく待ってからお試しください。",
        };
        return NextResponse.json(res);
      } else {
        // ロック期間が過ぎた場合はロックを解除
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isLocked: false,
            failedLoginAttempts: 0,
            lockedAt: null,
          },
        });
      }
    }

    // パスワードの検証
    const isValidPassword = await verifyPassword(loginRequest.password, user.password);
    
    if (!isValidPassword) {
      // 失敗回数を増加
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          isLocked: shouldLock,
          lockedAt: shouldLock ? new Date() : null,
        },
      });

      await recordLoginHistory(false);

      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: shouldLock 
          ? "連続してログインに失敗したため、アカウントがロックされました。"
          : "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // ログイン成功 - 失敗回数をリセット
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null,
        lastLoginAt: new Date(),
      },
    });

    await recordLoginHistory(true);
    resetLoginAttempts(clientIp);

    const tokenMaxAgeSeconds = AUTH_CONFIG.SESSION_DURATION_HOURS * 60 * 60;

    // セッションベース認証の処理
    await createSession(user.id, tokenMaxAgeSeconds, clientIp, userAgent);
    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "",
    };
    return NextResponse.json(res);

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログインのサーバサイドの処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
