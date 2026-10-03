"server-only";
import { combineChannelData } from "@/utils/combineChannelData";
import {
  CHANNEL_ORDER_MAP,
  endpointApi,
  GET_CHANNELS,
  GET_FEATURED,
  GET_VIDEOS,
  POST_CHANNELS,
} from "./config";
import {
  TEndpointChannelMetaResponse,
  TEndpointVideo,
  TEndpointChannel,
  TEndpointSearchResponse,
  TEndpointFeaturedResponse,
  TChannelDto,
  TRequestDuplicateCheckResult,
  TRequestsChannelsResult,
  TWaitingList,
} from "./type";
import { addEscapeCharacter } from "@/utils/regexp";

export const getAllVideos = () =>
  endpointApi.get<TEndpointVideo[]>(GET_VIDEOS.all).json();

export const getChannelsMeta = () =>
  endpointApi.get<TEndpointChannelMetaResponse>(GET_CHANNELS.meta).json();

export const getAllChannels = () =>
  endpointApi.get<TEndpointChannel[]>(GET_CHANNELS.index).json();

export const getChannelById = (channelId: string) =>
  endpointApi
    .get<TEndpointChannel>(GET_CHANNELS.index + `/${channelId}`)
    .json();

export const getWaitingChannels = () =>
  endpointApi.get<TWaitingList[]>(GET_CHANNELS.waiting).json();

export const getRegisteredChannelCount = () =>
  endpointApi.get<{ count: number }>(GET_CHANNELS.count).json();

export const searchChannels = (args: {
  /** @default - 1 */
  page?: number;
  /** @default - 20 */
  size?: number;
  sort?: keyof TEndpointChannel;
  direction?: "asc" | "desc";
  query?: string;
  queryType?: "name" | "handle" | "channelId";
}) => {
  const query = new URLSearchParams();
  if (args.page) query.set("page", args.page.toString());
  if (args.size) query.set("size", args.size.toString());
  if (args.sort) query.set("sort", args.sort);
  if (args.direction) query.set("direction", args.direction);
  if (args.query) query.set("query", args.query);
  if (args.queryType) query.set("queryType", args.queryType);

  return endpointApi
    .get<TEndpointSearchResponse>(GET_CHANNELS.search + `?${query.toString()}`)
    .json();
};

export const getChannelWithYoutube = async (dto: TChannelDto) => {
  const { sort, size, page, query, queryType } = dto;
  const direction = CHANNEL_ORDER_MAP[sort];

  const safeQuery = addEscapeCharacter((query || "").trim());

  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (size) searchParams.set("size", size.toString());
  if (safeQuery) searchParams.set("query", safeQuery);
  if (queryType) searchParams.set("queryType", queryType);
  if (sort) searchParams.set("sort", sort);
  if (direction) searchParams.set("direction", direction);

  // page=1&size=24&sort=name_kor&direction=asc // 사전순
  // page=1&size=24&sort=createdAt&direction=desc  // 등록순

  const res = await endpointApi
    .get<TEndpointSearchResponse>(
      GET_CHANNELS.search + `?${searchParams.toString()}`,
    )
    .json();

  const total = res.meta.total;
  const totalPage = res.meta.totalPage;

  const channelRecord = res.data.reduce<Record<string, TEndpointChannel>>(
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

export const getFeaturedChannels = () =>
  endpointApi.get<TEndpointFeaturedResponse>(GET_FEATURED.index).json();

export const parseChannel = (channel: TEndpointChannel | null) => ({
  channelId: channel?.channel_id || "no data",
  channelAddr: channel?.channel_addr || "no data",
  nameKor: channel?.name_kor || "no data",
  // handleName: channel?.handle_name || '',
});

export const checkDuplicatesChannels = (args: { urls: string[] }) =>
  endpointApi
    .post<TRequestDuplicateCheckResult>(POST_CHANNELS.checkDuplicates, {
      json: args,
    })
    .json();

export const requestsChannels = (args: {
  channels: {
    nameKor: string;
    channelId: string;
    handle: string;
  }[];
}) =>
  endpointApi
    .post<TRequestsChannelsResult>(POST_CHANNELS.requests, { json: args })
    .json();
