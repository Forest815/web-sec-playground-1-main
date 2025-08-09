import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { verifySession } from "@/app/api/_helper/verifySession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
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

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20, // 最新20件
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        createdAt: true,
      },
    });

    const res: ApiResponse<typeof loginHistory> = {
      success: true,
      payload: loginHistory,
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログイン履歴の取得に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
