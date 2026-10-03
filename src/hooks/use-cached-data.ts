"use client";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { clientApi } from "@/apis/fetcher";
import {
  BLACKLIST_TAG,
  CHANNELS_TAG,
  WHITELIST_TAG,
} from "@/constants/revalidate-tag";
import { TGetChannelRes } from "@/libraries/endpoint/type";

type LayoutDataObserverProps = {
  session: TSession | null;
};

const useCachedData = (args: LayoutDataObserverProps) => {
  const [channelList, blacklist, whitelist] = useQueries({
    queries: [
      {
        queryKey: [CHANNELS_TAG],
        queryFn: () =>
          clientApi
            .get<TGetChannelRes>("v1/channel")
            .json()
            .then((json) => json.data),
        gcTime: Infinity,
      },
      {
        queryKey: [BLACKLIST_TAG, args.session?.email],
        queryFn: () =>
          clientApi
            .get<{ message: string; data: string[] }>("v1/blacklist")
            .json()
            .then((json) => json.data),
        enabled: !!args.session,
        gcTime: Infinity,
      },
      {
        queryKey: [WHITELIST_TAG, args.session?.email],
        queryFn: () =>
          clientApi
            .get<{ message: string; data: string[] }>("v1/whitelist")
            .json()
            .then((json) => json.data),
        enabled: !!args.session,
        gcTime: Infinity,
      },
    ],
  });

  const channelMap = useMemo(() => {
    if (!channelList.data) return {};
    const channelData = Object.fromEntries(
      channelList.data.map((channel) => {
        return [channel.channel_id, channel];
      }),
    );
    return channelData;
  }, [channelList.data]);

  const blackListMap = useMemo(() => {
    return new Set(blacklist.data);
  }, [blacklist.data]);

  const whiteListMap = useMemo(() => {
    return new Set(whitelist.data);
  }, [whitelist.data]);

  return {
    channelMap,
    blackListMap,
    whiteListMap,
  };
};

export default useCachedData;
