import errorHandler from "@/libraries/error/handler";
import { getWaitingChannels } from "@/libraries/endpoint/service";
import type { WaitingListItem } from "@/libraries/endpoint/type";
import { NextResponse } from "next/server";

export type TGetChannelRes = {
  message: string;
  data: WaitingListItem[];
};

export async function GET() {
  try {
    const data = await getWaitingChannels();
    return NextResponse.json({ message: "채널 목록을 조회했습니다.", data });
  } catch (error) {
    console.error(error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message, data: [] }, { status });
  }
}

export const dynamic = "force-dynamic";
