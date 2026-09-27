import {
  UseQueryResult,
  useIsFetching,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { clientApi } from "@/apis/fetcher";
import { SCHEDULE_CACHE_TIME, SCROLL_PER_YOUTUBE_CARD } from "@/constants";
import { SCHEDULES_TAG } from "@/constants/revalidate-tag";
import dayjs from "@/libraries/dayjs";
import { useTranslations } from "@/libraries/i18n/client";
import { TLocaleCode } from "@/libraries/i18n/type";
import { TParsedClientContent } from "@/libraries/endpoint/type";
import { StreamFilter } from "@/types";
import { TGetScheduleResponse } from "@/types/api/schedule";
import { waitfor } from "@/utils/helper";
import { replaceParentheses } from "@/utils/regexp";
import { getInterval } from "@/utils/time";
import { useAutoSync } from "./use-storage";

export function useScheduleQuery(arg: {
  filter: StreamFilter;
  enableAutoSync: boolean;
  locale: TLocaleCode;
}): UseQueryResult<TParsedClientContent[]>;
export function useScheduleQuery(arg: {
  enableAutoSync: boolean;
  locale: TLocaleCode;
}): UseQueryResult<{
  scheduled: TParsedClientContent[];
  live: TParsedClientContent[];
  daily: TParsedClientContent[];
  all: TParsedClientContent[];
}>;
export function useScheduleQuery(arg: {
  filter?: StreamFilter;
  /** 유저설정과 관계없이 페이지별로 설정옵션 */
  enableAutoSync: boolean;
  locale: TLocaleCode;
}) {
  const { isActive, refreshInterval } = useAutoSync(); //유저설정
  const { t } = useTranslations();

  const userCacheTime = isActive ? refreshInterval * 60 * 1000 : false;

  // a tag, window.location.href, window.location.reload() 등을 사용하여 페이지 이동시 캐시가 무효화됨
  const query = useQuery({
    queryKey: [SCHEDULES_TAG, arg.locale],
    queryFn: () =>
      clientApi
        .get<TGetScheduleResponse>("v1/schedule")
        .json()
        .then((res) => {
          const scheduled: TParsedClientContent[] = [];
          const live: TParsedClientContent[] = [];
          const daily: TParsedClientContent[] = [];
          const all: TParsedClientContent[] = [];

          const yesterday = dayjs().subtract(1, "day");

          for (const item of res.data) {
            const parsedData: TParsedClientContent = {
              videoId: item.videoId,
              channelId: item.channelId,
              broadcastStatus: item.broadcastStatus,
              isHide: item.isHide,
              isVideo: item.isVideo,
              // 가공된 데이터
              title: replaceParentheses(item.title),
              viewer: item.viewer,
              utcTime: dayjs(item.utcTime),
              interval: getInterval(item.utcTime, t),
            };

            if (
              parsedData.isHide === true &&
              parsedData.broadcastStatus == "NULL"
            ) {
              // 취소여부 확인
              parsedData.broadcastStatus = "FALSE";
            }

            if (
              parsedData.broadcastStatus === "TRUE" ||
              parsedData.broadcastStatus === "NULL"
            ) {
              scheduled.push(parsedData);
            }

            if (parsedData.broadcastStatus === "TRUE") {
              live.push(parsedData);
            }

            if (parsedData.utcTime.isAfter(yesterday)) {
              daily.push(parsedData);
            }

            all.push(parsedData);
          }

          return { scheduled, live, daily, all };
        }),
    select: (data) => {
      switch (arg?.filter) {
        case StreamFilter.scheduled:
          return data.scheduled;
        case StreamFilter.live:
          return data.live;
        case StreamFilter.all:
          return data.all;
        case StreamFilter.daily:
          return data.daily;
        default:
          return data;
      }
    },
    staleTime: SCHEDULE_CACHE_TIME, // 페이지 이동시 SCHEDULE_CACHE_TIME 동안은 캐시를 사용, data-fetching이 발생하지 않음
    gcTime: SCHEDULE_CACHE_TIME, // stale time이 지나지 않으면 data-fetch 중에 stale된 data를 대신 보여줌, isPending과 관계가 있음
    refetchInterval: arg?.enableAutoSync ? userCacheTime : false, // 페이지내 동기화 주기, 같은 페이지내에서 주기적으로 호출
    refetchOnReconnect: isActive,
    refetchOnWindowFocus: isActive,
    refetchIntervalInBackground: false,
  });

  return query;
}

export const useInfiniteScheduleData = ({
  rawData,
}: {
  rawData: TParsedClientContent[];
}) => {
  const [scrollPage, setScrollPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const maxPage = Math.ceil(rawData.length / SCROLL_PER_YOUTUBE_CARD);
  const isDone = scrollPage >= maxPage;

  const handleInfinityScroll = async () => {
    if (isLoading || isDone) return;
    setIsLoading(() => true);

    await waitfor(500); // 성능 최적화를 위한 딜레이

    setScrollPage((pre) => pre + 1);
    setIsLoading(() => false);
  };

  const loadContents = useMemo(
    () => rawData.slice(0, SCROLL_PER_YOUTUBE_CARD * scrollPage),
    [rawData, scrollPage],
  );

  return {
    handleInfinityScroll,
    loadContents,
    isLoading,
  };
};

/** query observer가 없을때 undefined 반환 */
export const useScheduleStatus = () => {
  "use no memo";
  const queryClient = useQueryClient();
  useIsFetching({ queryKey: [SCHEDULES_TAG] }); //리랜더링용

  return queryClient.getQueryState([SCHEDULES_TAG])?.status;
};
