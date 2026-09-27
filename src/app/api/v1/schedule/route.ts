import CustomServerError from "@/libraries/error/customServerError";
import errorHandler from "@/libraries/error/handler";
import { TGetScheduleResponse } from "@/types/api/schedule";
import { NextResponse } from "next/server";
import { getAllVideos } from "@/libraries/endpoint/service";
import { TParsedServerContent } from "@/libraries/endpoint/type";
import dayjs from "@/libraries/dayjs";

export async function GET() {
  try {
    const scheduleData = await getAllVideos();

    if (!scheduleData) {
      throw new CustomServerError({
        statusCode: 404,
        message: "데이터를 찾을 수 없습니다.",
      });
    }

    const parseScheduledData = scheduleData.map<TParsedServerContent>(
      (raw) => ({
        title: raw.Title,
        videoId: raw.VideoId,
        channelId: raw.ChannelId,
        utcTime: dayjs(raw.ScheduledTime).toDate(),
        broadcastStatus: raw.broadcastStatus,
        isHide: raw.Hide === "TRUE" ? true : false,
        isVideo: raw.isVideo === "TRUE" ? true : false,
        viewer: raw.concurrentViewers,
      }),
    );

    return NextResponse.json<TGetScheduleResponse>({
      message: "스케줄이 조회되었습니다.",
      data: parseScheduledData,
    });
  } catch (error) {
    console.error(error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message, data: null }, { status });
  }
}

export const dynamic = "force-dynamic";
