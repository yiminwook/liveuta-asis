import { checkDuplicatesChannels } from "@/libraries/endpoint/service";
import { checkDuplicatesDto } from "@/libraries/endpoint/type";
import BadReqError from "@/libraries/error/badRequestError";
import errorHandler from "@/libraries/error/handler";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = checkDuplicatesDto.safeParse(body);

    if (dto.error) {
      throw new BadReqError(z.prettifyError(dto.error));
    }

    const result = await checkDuplicatesChannels(dto.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/v1/channel/check-duplicates", error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message }, { status });
  }
}

export const dynamic = "force-dynamic";
