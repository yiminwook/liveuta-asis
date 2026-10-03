import { getRegisteredChannelCount } from "@/libraries/endpoint/service";
import errorHandler from "@/libraries/error/handler";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getRegisteredChannelCount();
    return NextResponse.json({
      message: "등록된 채널 수를 조회했습니다.",
      data,
    });
  } catch (error) {
    console.error(error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message }, { status });
  }
}

export const dynamic = "force-dynamic";
