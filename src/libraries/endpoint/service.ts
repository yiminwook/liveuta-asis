"server-only";
import { endpointApi, GET_CHANNELS, GET_FEATURED, GET_VIDEOS } from "./config";
import {
  TEndpointChannelMetaResponse,
  TEndpointVideo,
  TEndpointChannel,
  TEndpointSearchResponse,
  TEndpointFeaturedResponse,
} from "./type";

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
  endpointApi.get<TEndpointChannel[]>(GET_CHANNELS.waiting).json();

export const getChannelCount = () =>
  endpointApi.get<{ count: number }>(GET_CHANNELS.count).json();

export const searchChannels = (args: {
  /** @default - 1 */
  page?: number;
  /** @default - 20 */
  size?: number;
  sort?: keyof TEndpointChannel;
  order?: "asc" | "desc";
  query?: string;
  queryType?: "name" | "handle" | "channelId";
}) => {
  const query = new URLSearchParams();
  if (args.page) query.set("page", args.page.toString());
  if (args.size) query.set("size", args.size.toString());
  if (args.sort) query.set("sort", args.sort);
  if (args.order) query.set("order", args.order);
  if (args.query) query.set("query", args.query);
  if (args.queryType) query.set("queryType", args.queryType);

  return endpointApi
    .get<TEndpointSearchResponse>(GET_CHANNELS.search + `?${query.toString()}`)
    .json();
};

export const getFeaturedChannels = () =>
  endpointApi.get<TEndpointFeaturedResponse>(GET_FEATURED.index).json();
