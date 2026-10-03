import { requestsChannels } from "@/libraries/endpoint/service";
import { channelRequestDto } from "@/libraries/endpoint/type";
import BadReqError from "@/libraries/error/badRequestError";
import errorHandler from "@/libraries/error/handler";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = channelRequestDto.safeParse(body);

    if (dto.error) {
      throw new BadReqError(z.prettifyError(dto.error));
    }

    const result = await requestsChannels(dto.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/v1/channel/requests", error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message }, { status });
  }
}

export const dynamic = "force-dynamic";
