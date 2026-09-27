import { NextRequest, NextResponse } from "next/server";
import errorHandler from "@/libraries/error/handler";
import { getAllChannels } from "@/libraries/endpoint/service";
import { TEndpointChannel } from "@/libraries/endpoint/type";

export type TGetChannelRes = {
  message: string;
  data: TEndpointChannel[];
};

export async function GET(req: NextRequest) {
  try {
    const data = await getAllChannels();
    return NextResponse.json({ message: "채널 목록을 조회했습니다.", data });
  } catch (error) {
    console.error(error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message, data: null }, { status });
  }
}

export const revalidate = 1800;
