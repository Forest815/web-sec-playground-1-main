import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();
    
    if (!email) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスが必要です。",
      };
      return NextResponse.json(res);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const res: ApiResponse<{ exists: boolean }> = {
      success: true,
      payload: { exists: !!existingUser },
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "メールアドレスの確認に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
