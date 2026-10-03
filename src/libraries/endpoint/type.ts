import { ITEMS_PER_PAGE } from "@/constants";
import type dayjs from "@/libraries/dayjs";
import { CHANNEL_QUERY_TYPE, CHANNEL_SORT } from "@/types";
import z from "zod";
import { getChannelWithYoutube, parseChannel } from "./service";
import { youtube_v3 } from "googleapis";

export type TContentLength = {
  total: number;
  video: number;
  stream: number;
};

export type TStream = "TRUE" | "NULL" | "FALSE";

export const STREAM_STATUS_MAPPER = {
  TRUE: "stream",
  FALSE: "closed",
  NULL: "scheduled",
} as const;

/**
 * @example
 * {
 *  "VideoId": "xTBoq6VbQa0",
 *  "Title": "#87【アコギ弾き語り練習｜歌枠 】　リハビリ　【ギター練習】",
 *  "ChannelName": "후구카라",
 *  "ChannelId": "UC4oB9i4ZXTUFDQa4nulSdzA",
 *  "isVideo": "FALSE",
 *  "ScheduledTime": "2026-09-24T06:15:00",
 *  "thumbnail_url": "https://i.ytimg.com/vi/xTBoq6VbQa0/mqdefault.jpg",
 *  "broadcastStatus": "FALSE",
 *  "Hide": "TRUE",
 *  "concurrentViewers": 14
 * }
 */
export interface TEndpointVideo {
  VideoId: string;
  Title: string;
  ChannelName: string;
  ChannelId: string;
  isVideo: "TRUE" | "FALSE";
  ScheduledTime: string;
  thumbnail_url: string;
  broadcastStatus: TStream;
  Hide: "TRUE" | "FALSE";
  concurrentViewers: number;
}

/**
 * @example
 * {
 *  "channel_id": "UC1ios5pqZnqHqOB6qacwSng",
 *  "name_kor": "카이키 체르타",
 *  "channel_addr": "https://www.youtube.com/channel/UC1ios5pqZnqHqOB6qacwSng",
 *  "handle_name": "@kaiikicaerta",
 *  "createdAt": "2026-09-21T02:14:23.952000",
 *  "waiting": false,
 *  "alive": true,
 *  "names": [
 *    "카이키 체르타",
 *    "灰域チェルタ"
 *  ],
 *  "profile_picture_url": "https://yt3.ggpht.com/GLcYdhMiDSG2sTykoRoGIYxIJqNNWqyCctWGNCqY_FMvYeSEsq2jnACqIjBs__Iuw4E5AQGzQA"
 * }
 */
export interface TEndpointChannel {
  channel_id: string;
  name_kor: string;
  channel_addr: string;
  handle_name: string;
  createdAt: string;
  waiting: boolean;
  alive: boolean;
  names: string[];
  profile_picture_url: string;
}

/** 등록대기 채널 */
export type TWaitingList = {
  name_kor: string;
  channel_addr: string;
};

export type TChannelRecord = Record<string, TEndpointChannel>;

export type TParsedServerContent = {
  title: string;
  videoId: string;
  channelId: string;
  broadcastStatus: TStream;

  viewer: number;
  utcTime: Date;

  // 가공된 데이터
  isVideo: boolean;
  isHide: boolean;
};

export type TParsedClientContent = {
  videoId: string;
  channelId: string;
  broadcastStatus: TStream;
  isHide: boolean;
  isVideo: boolean;

  // 가공된 데이터
  title: string;
  viewer: number;
  utcTime: dayjs.Dayjs;
  interval: string;
};

export type TYChannelReturn = ReturnType<typeof getChannelWithYoutube>;
export type ChannelDatesetItem = ReturnType<typeof parseChannel>;

export type TEndpointSearchResponse = {
  data: TEndpointChannel[];
  meta: {
    total: number;
    totalPage: number;
    page: number;
    size: number;
  };
};

export type TEndpointChannelMetaResponse = {
  /** @example: "2026-08-30T05:19:08.548312Z */
  updated_at: string;
  count: number;
};

/**
 * @example
 * {
 *  "channel_addr": "https://www.youtube.com/@VESPERBELL",
 *  "channel_id": "UCPd0Z22gF43dUidPYEQO5-w",
 *  "handle_name": "@VESPERBELL",
 *  "name_kor": "VESPERBELL 베스퍼벨",
 *  "waiting": false,
 *  "names": [
 *    "VESPERBELL",
 *    "VESPERBELL 베스퍼벨"
 *  ],
 *  "profile_picture_url": "https://yt3.ggpht.com/LW2ItRF0lIoQekfNWu0sd95qlg_ZwA6djnQQXki-JVOsEX-1IA9U7rT8kKG2idlGzJDPraATLw"
 * }
 */
export interface TEndpointFeatured {
  channel_addr: string;
  channel_id: string;
  handle_name: string;
  name_kor: string;
  waiting: boolean;
  names: string[];
  profile_picture_url: string;
}

export interface TEndpointFeaturedResponse {
  top_channels: TEndpointFeatured[];
  promising: TEndpointFeatured[];
  video_pick: TEndpointVideo[];
  /** @example: "2024-12-26T00:58:24.806153+09:00 */
  last_updated: string;
}

export type TFeaturedDataAPIReturn = {
  lastUpdateAt: string;
  topRating: youtube_v3.Schema$Channel[];
  promising: youtube_v3.Schema$Channel[];
};

export type TCheckDuplicatesBatchSuccessResult = {
  url: string; // 요청한 URL
  channelId: string; // 확인된 채널 ID
  handle: string; // @handle (없으면 '')
  channelTitle: string; // 채널 제목 (없으면 '')
  existingName: string; // 중복일 때 기존 한글명, 없으면 ''
  error: null;
};

export type TCheckDuplicatesBatchErrorResult = {
  url: string; // 요청한 URL
  channelId: null; // 실패이므로 null
  handle: null; // 동일
  channelTitle: null; // 동일
  existingName: string; // 항상 '' (빈 문자열)
  error: string; // 오류 코드: 'resolve_failed' 등
};

export type TCheckDuplicatesBatchResult =
  | TCheckDuplicatesBatchSuccessResult
  | TCheckDuplicatesBatchErrorResult;

export type TRequestDuplicateCheckResult = {
  results: TCheckDuplicatesBatchResult[];
};

export type TRequestsChannelsResult = {
  inserted: number;
};

/////// API Request Types //////

export const checkDuplicatesDto = z.object({
  urls: z.array(z.string()),
});

export type TCheckDuplicatesDto = z.infer<typeof checkDuplicatesDto>;

export const channelRequestDto = z.object({
  channels: z.array(
    z.object({
      nameKor: z.string(),
      channelId: z.string(),
      handle: z.string(),
    }),
  ),
});

export type TChannelRequestDto = z.infer<typeof channelRequestDto>;

export const channelDto = z.object({
  query: z.string().nullish(),
  queryType: z.enum(CHANNEL_QUERY_TYPE).nullish(),
  page: z.preprocess((input) => Number(input ?? 1), z.number().int().min(1)),
  size: z.preprocess(
    (input) => Number(input ?? 1),
    z.number().int().min(1).max(ITEMS_PER_PAGE),
  ),
  sort: z
    .enum(CHANNEL_SORT)
    .nullish()
    .transform((value) => value || "name_kor"),
});

export type TChannelDto = z.infer<typeof channelDto>;

/////// API Response Types //////

export type TGetRegisteredChannelCountRes = {
  message: string;
  data: { count: number };
};

export type TGetChannelRes = {
  message: string;
  data: TEndpointChannel[];
};

export type TGetWaitingChannelRes = {
  message: string;
  data: TWaitingList[];
};
