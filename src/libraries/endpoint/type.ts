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
