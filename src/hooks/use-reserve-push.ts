import { PushData } from "@api/_push/route";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/apis/fetcher";
import { generateFcmToken } from "@/libraries/firebase/generate-fcm-token";
import { useTranslations } from "@/libraries/i18n/client";
import {
  TEndpointChannel,
  TParsedClientContent,
} from "@/libraries/endpoint/type";
import { generateThumbnail, generateVideoUrl } from "@/libraries/youtube/url";
import { gtagClick } from "@/utils/gtag";

export type TReservePushArgs = {
  title: string;
  body: string;
  token: string;
  timestamp: string;
  imageUrl: string;
  link: string;
  channelName: string;
};

const useReservePush = () => {
  const { t } = useTranslations();

  const mutatePush = useMutation({
    mutationFn: async (arg: TReservePushArgs) => {
      const data: PushData = {
        title: arg.title,
        body: arg.body,
        token: arg.token,
        timestamp: arg.timestamp,
        imageUrl: arg.imageUrl,
        link: arg.link,
      };

      const json = await clientApi
        .post<{ message: string }>("v1/reserve/push", {
          json: data,
        })
        .json();

      return {
        message: json.message,
        channelName: arg.channelName,
        title: arg.title,
      };
    },
    onSuccess: (response) => {
      gtagClick({
        target: "sheduleAlarm",
        content: response.channelName,
        detail: response.title,
        action: "alamReserve",
      });

      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reservePush = async (
    content: TParsedClientContent,
    channel: TEndpointChannel | undefined,
  ) => {
    if (mutatePush.isPending) return;
    const token = await generateFcmToken();

    if (token === undefined) {
      throw new Error(t("hooks.useReservePush.tokenError"));
    }

    mutatePush.mutate({
      title: t("hooks.useReservePush.title"),
      body: `${t("hooks.useReservePush.body", { channelName: channel?.name_kor || "" })}`,
      token,
      timestamp: content.utcTime.toString(),
      imageUrl: generateThumbnail(content.videoId, "mqdefault"),
      link: generateVideoUrl(content.videoId),
      channelName: channel?.name_kor || "",
    });
  };

  return { reservePush, mutatePush };
};

export default useReservePush;
