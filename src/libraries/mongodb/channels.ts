import "server-only";
import { MONGODB_CHANNEL_COLLECTION, MONGODB_MANAGEMENT_DB } from "@/constants";
import { combineChannelData } from "@/utils/combineChannelData";
import { addEscapeCharacter } from "@/utils/regexp";
import { Document, Filter } from "mongodb";
import { connectMongoDB } from ".";
import {
  TChannelDto,
  TEndpointChannel,
  WaitingListItem,
} from "../endpoint/type";

export const CHANNEL_ORDER_MAP = {
  createdAt: -1, // 최신순
  name_kor: 1, // 이름순
} as const;

export const getChannelById = async (channel_id: string) => {
  const db = await connectMongoDB(
    MONGODB_MANAGEMENT_DB,
    MONGODB_CHANNEL_COLLECTION,
  );
  const channel = await db.findOne<TEndpointChannel>({ channel_id });
  return channel;
};

export const getAllChannel = async (dto: TChannelDto) => {
  const direction = CHANNEL_ORDER_MAP[dto.sort];

  const db = await connectMongoDB(
    MONGODB_MANAGEMENT_DB,
    MONGODB_CHANNEL_COLLECTION,
  );
  const channels = await db
    .find<TEndpointChannel>({ waiting: false }, { projection: { _id: 0 } })
    .sort(dto.sort, direction)
    .toArray();

  return channels;
};

export const getChannelWithYoutube = async (dto: TChannelDto) => {
  const { sort, size, page, query, queryType } = dto;
  const direction = CHANNEL_ORDER_MAP[sort];

  const safeQuery = addEscapeCharacter((query || "").trim());

  const regexForDBQuery: Filter<Document> = {
    $or: [],
    waiting: false,
  };

  switch (queryType) {
    case "name":
      regexForDBQuery.$or!.push(
        { names: { $regex: safeQuery, $options: "i" } },
        { name_kor: { $regex: safeQuery, $options: "i" } },
      );
      break;
    case "handle":
      regexForDBQuery.$or!.push({
        handle_name: { $regex: safeQuery, $options: "i" },
      });
      break;
    case "channelId":
      regexForDBQuery.$or!.push({
        channel_id: { $regex: safeQuery, $options: "i" },
      });
      break;
  }

  const skip = (page - 1) * size;
  const filter = !!query ? regexForDBQuery : { waiting: false };

  const db = await connectMongoDB(
    MONGODB_MANAGEMENT_DB,
    MONGODB_CHANNEL_COLLECTION,
  );

  const channels = await db
    .find<TEndpointChannel>(filter, {
      projection: { _id: 0 },
    })
    .sort(sort, direction)
    .skip(skip)
    .limit(size)
    .toArray();

  const total = await db.countDocuments(filter);
  const totalPage = Math.ceil(total / size);

  const channelRecord = channels.reduce<Record<string, TEndpointChannel>>(
    (acc, curr) => {
      acc[curr.channel_id] = { ...curr };
      return acc;
    },
    {},
  );

  const combinedChannelContents = await combineChannelData(channelRecord, {
    sort: sort,
  });

  return { contents: combinedChannelContents, total, totalPage };
};

export async function getRegisteredChannelCount() {
  const db = await connectMongoDB(
    MONGODB_MANAGEMENT_DB,
    MONGODB_CHANNEL_COLLECTION,
  );
  const count = await db.countDocuments({ waiting: false });
  return count;
}

export async function getWaitingList() {
  const db = await connectMongoDB(
    MONGODB_MANAGEMENT_DB,
    MONGODB_CHANNEL_COLLECTION,
  );
  const channels = await db
    .find<WaitingListItem>(
      { waiting: true },
      {
        projection: {
          _id: 0,
          name_kor: 1,
          channel_addr: 1,
        },
      },
    )
    .toArray();

  return channels;
}
