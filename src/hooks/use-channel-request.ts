import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { clientApi } from "@/apis/fetcher";
import { CHANNEL_COUNT_TAG, WAITING_TAG } from "@/constants/revalidate-tag";
import {
  TChannelRequestDto,
  TCheckDuplicatesDto,
  TGetRegisteredChannelCountRes,
  TGetWaitingChannelRes,
  TRequestDuplicateCheckResult,
  TRequestsChannelsResult,
} from "@/libraries/endpoint/type";

export const useChannelCountSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: [CHANNEL_COUNT_TAG],
    queryFn: () =>
      clientApi
        .get<TGetRegisteredChannelCountRes>("v1/channel/count")
        .json()
        .then((json) => json.data),
  });
};

export const useWaitingListSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: [WAITING_TAG],
    queryFn: () =>
      clientApi
        .get<TGetWaitingChannelRes>("v1/channel/waiting")
        .json()
        .then((json) => json.data),
  });
};

export const useSubmitChannelMutation = () => {
  return useMutation({
    mutationFn: (arg: TChannelRequestDto) =>
      clientApi
        .post<TRequestsChannelsResult>("v1/channel/requests", { json: arg })
        .json(),
  });
};

export const useValidateChannelsMutation = () => {
  return useMutation({
    mutationFn: (args: TCheckDuplicatesDto) =>
      clientApi
        .post<TRequestDuplicateCheckResult>("v1/channel/check-duplicates", {
          json: args,
        })
        .json()
        .then((json) => json.results),
  });
};
