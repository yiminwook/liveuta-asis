import { PushData } from "@api/_push/route";
import { NextRequest, NextResponse } from "next/server";
import errorHandler from "@/libraries/error/handler";
// import { MONGODB_NOTI_COLLECTION, MONGODB_SCHEDULE_DB } from "@/constants";
// import { connectMongoDB } from "@/libraries/mongodb";

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json(
      { message: "현재 지원하고 있지 않은 기능입니다.", data: null },
      { status: 403 },
    );

    const requestBody: PushData = await req.json();

    // const db = await connectMongoDB(MONGODB_SCHEDULE_DB, MONGODB_NOTI_COLLECTION);

    // const readResult = await db.findOne({
    //   token: requestBody.token,
    //   link: requestBody.link,
    // });

    // if (readResult) {
    //   await db.deleteOne(readResult);
    //   return NextResponse.json({ message: '알림이 취소되었습니다.', data: null });
    // }

    // await db.insertOne(requestBody);
    return NextResponse.json(
      { message: "알림이 예약되었습니다.", data: null },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ message, data: null }, { status });
  }
}
