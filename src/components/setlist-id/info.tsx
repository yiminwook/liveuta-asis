"use client";
import { useRouter } from "@bprogress/next";
import { Avatar, Button } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeft, ListMusic } from "lucide-react";
import { isMobile } from "react-device-detect";
import { toast } from "sonner";
import { clientApi } from "@/apis/fetcher";
import { SETLISTS_TAG } from "@/constants/revalidate-tag";
import { useMount } from "@/hooks/use-mount";
import { useUserInfo } from "@/hooks/use-user-info";
import { LogosYoutubeIcon } from "@/icons";
import dayjs from "@/libraries/dayjs";
import { Link } from "@/libraries/i18n";
import { useLocale, useTranslations } from "@/libraries/i18n/client";
import { ChannelDatesetItem } from "@/libraries/endpoint/type";
import { Setlist } from "@/libraries/oracledb/setlist/service";
import { generateChannelUrl, generateVideoUrl } from "@/libraries/youtube/url";
import { usePlayer } from "@/stores/player";
import { useSession } from "@/stores/session";
import { DeleteSetlistRes, SETLIST_DELETE_LEVEL } from "@/types/api/setlist";
import { openWindow } from "@/utils/window-event";
import css from "./info.module.scss";

type InfoProps = {
  setlist: Setlist;
  channel: ChannelDatesetItem;
  icon: string;
};

export default function Info({ setlist, channel, icon }: InfoProps) {
  const locale = useLocale();
  const { t } = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const session = useSession((state) => state.session);
  const userInfo = useUserInfo({ session });

  const videoUrl = generateVideoUrl(setlist.videoId);
  const channelUrl = generateChannelUrl(channel.channelId);

  const actions = usePlayer((state) => state.actions);

  const handleLocation = (url: string) => {
    if (isMobile) {
      window.location.href = url;
    } else {
      openWindow(url);
    }
  };

  const mutateDelete = useMutation({
    mutationFn: (args: { videoId: string }) =>
      clientApi.delete<DeleteSetlistRes>(`v1/setlist/${args.videoId}`).json(),
    onSuccess: () => {
      toast.success(t("setlistId.info.deleted"));
      queryClient.invalidateQueries({ queryKey: [SETLISTS_TAG] });
      actions.reset();
      router.back();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePermission =
    userInfo.data && userInfo.data?.userLv >= SETLIST_DELETE_LEVEL;

  return (
    <div className={css.wrap}>
      <nav className={css.nav}>
        <Button
          className={css.backButton}
          classNames={{ label: css.buttonLabel }}
          variant="transparent"
          onClick={() => router.back()}
        >
          <ArrowLeft size="1.2rem" />
          <span>{t("setlistId.info.back")}</span>
        </Button>
        <div className={css.navRight}>
          {deletePermission && (
            <Button
              className={css.navItem}
              color="red"
              onClick={() => {
                if (confirm(t("setlistId.info.deleteConfirm")))
                  mutateDelete.mutate({ videoId: setlist.videoId });
              }}
              loading={mutateDelete.isPending}
              disabled={!session}
            >
              <span className={css.letterWide}>삭제</span>
            </Button>
          )}
          <Button
            className={clsx(css.navItem, css.hoverButton)}
            classNames={{ label: css.buttonLabel }}
            variant="transparent"
            onClick={() => handleLocation(videoUrl)}
          >
            <LogosYoutubeIcon width="1.2rem" height="1.2rem" />
            {t("setlistId.info.youtube")}
          </Button>
          <Button
            component={Link}
            locale={locale}
            className={clsx(css.navItem, css.hoverButton)}
            classNames={{ label: css.buttonLabel }}
            variant="transparent"
            href="/setlist"
          >
            <ListMusic size="1.2rem" />
            {t("setlistId.info.list")}
          </Button>
        </div>
      </nav>
      <div className={css.infoSection}>
        <h2 className={css.title}>{setlist.title}</h2>
        <button
          className={css.channel}
          onClick={() => handleLocation(channelUrl)}
        >
          <Avatar
            className={css.avatar}
            src={icon}
            alt={t("setlistId.info.avatarAlt")}
            size="md"
          />
          <p className={css.channelName}>{channel.nameKor}</p>
        </button>
        <br />

        <TimeBoxs
          broadcastAt={setlist.broadcastAt}
          createdAt={setlist.createdAt}
          updatedAt={setlist.updatedAt}
        />
      </div>
    </div>
  );
}

interface TimeBoxProps {
  broadcastAt: string;
  createdAt: string;
  updatedAt: string;
}

function TimeBoxs({ broadcastAt, createdAt, updatedAt }: TimeBoxProps) {
  const { t } = useTranslations();
  const isMounted = useMount();

  const broadcast = dayjs(broadcastAt).format(t("time.shortTemplate"));
  const create = dayjs(createdAt).format(t("time.shortTemplate"));
  const update = dayjs(updatedAt).format(t("time.shortTemplate"));

  if (!isMounted) return null;

  return (
    <>
      <div>
        {t("setlistId.info.streamDate")}: {broadcast}
      </div>
      <div>
        {t("setlistId.info.createDate")}: {create}
      </div>
      <div>
        {t("setlistId.info.lastModified")}: {update}
      </div>
    </>
  );
}
