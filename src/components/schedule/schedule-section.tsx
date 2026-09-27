"use client";
import { Button, Loader } from "@mantine/core";
import variable from "@variable";
import { GridComponents, VirtuosoGrid } from "react-virtuoso";
import { toast } from "sonner";
import useMutateWhitelist from "@/hooks/use-delete-whitelist";
import usePostBlacklist from "@/hooks/use-post-blacklist";
import usePostWhitelist from "@/hooks/use-post-whitelist";
import useReservePush from "@/hooks/use-reserve-push";
import { useInfiniteScheduleData } from "@/hooks/use-schedule";
import { Link } from "@/libraries/i18n";
import { useLocale, useTranslations } from "@/libraries/i18n/client";
import {
  TEndpointChannel,
  TParsedClientContent,
} from "@/libraries/endpoint/type";
import { generateVideoUrl } from "@/libraries/youtube/url";
import { useSetModalStore } from "@/stores/modal";
import { TScheduleDto } from "@/types/dto";
import { gtagClick } from "@/utils/gtag";
import { openWindow } from "@/utils/window-event";
import Nodata from "../common/Nodata";
import ScheduleCard from "../common/scheduleCard/card";
import ScheduleCardSkeleton from "../common/scheduleCard/schedule-card-skeleton";
import css from "./ScheduleSection.module.scss";

type ScheduleSectionProps = {
  session: TSession | null;
  scheduleDto: TScheduleDto;
  contents: TParsedClientContent[];
  channelMap: Record<string, TEndpointChannel>;
  whiteListMap: Set<string>;
  isLoading?: boolean;
};

export default function ScheduleSection({
  session,
  scheduleDto,
  contents,
  channelMap,
  whiteListMap,
  isLoading = false,
}: ScheduleSectionProps) {
  const modalStore = useSetModalStore();
  const locale = useLocale();
  const { t } = useTranslations();

  const {
    loadContents,
    isLoading: isLoadingScroll,
    handleInfinityScroll,
  } = useInfiniteScheduleData({
    rawData: contents,
  });

  const mutateBlock = usePostBlacklist();
  const mutatePostFavorite = usePostWhitelist();
  const mutateDeleteFavorite = useMutateWhitelist();
  const { reservePush } = useReservePush();

  const handleFavorite = (content: TParsedClientContent) => {
    const email = session?.email;

    if (!email) {
      toast.error(t("schedule.scheduleSection.notLoggedInError"));
      return;
    }

    const isFavorite = whiteListMap.has(content.channelId);

    if (
      !isFavorite &&
      confirm(t("schedule.scheduleSection.addFavoriteChannel"))
    ) {
      mutatePostFavorite.mutate({ channelId: content.channelId, email });
    } else if (
      isFavorite &&
      confirm(t("schedule.scheduleSection.removeFavoriteChannel"))
    ) {
      mutateDeleteFavorite.mutate({ channelId: content.channelId, email });
    }
  };

  const handleBlock = async (content: TParsedClientContent) => {
    const email = session?.email;

    if (!email) {
      toast.error(t("schedule.scheduleSection.notLoggedInError"));
      return;
    }

    if (confirm(t("schedule.scheduleSection.blockChannel"))) {
      mutateBlock.mutate({ channelId: content.channelId, email });
    }
  };

  const openStream = (content: TParsedClientContent) => {
    gtagClick({
      target: "scheduleCard",
      content: content.channelId,
      detail: content.title,
      action: "openWindow",
    });

    openWindow(generateVideoUrl(content.videoId));
  };

  if (isLoading) {
    return (
      <section>
        <div className={css.list}>
          {new Array(10).fill(null).map((_, i) => (
            <div key={`placeholder_${i}`} className={css.item}>
              <ScheduleCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (contents.length === 0 && scheduleDto.query.trim() !== "") {
    // 검색 결과가 없을 때
    return (
      <section style={{ marginBlock: "5rem" }}>
        <Nodata />
        <div className={css.nodataLinkBox}>
          <Button
            component={Link}
            href={`/channel?query-type=name&q=${scheduleDto.query}`}
            locale={locale}
          >
            {t("schedule.scheduleSection.searchAtChannelPage")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <VirtuosoGrid
        context={{
          isLoading: isLoadingScroll,
        }}
        components={{
          Footer: ScrollFooter,
        }}
        totalCount={loadContents.length}
        data={loadContents}
        listClassName={css.list}
        itemClassName={css.item}
        useWindowScroll
        itemContent={(_i, data) => (
          <ScheduleCard
            key={`scheduled_${data.videoId}`}
            session={session}
            content={data}
            channel={channelMap[data.channelId]}
            openNewTab={openStream}
            addAlarm={reservePush}
            toggleFavorite={handleFavorite}
            addBlock={handleBlock}
            isFavorite={whiteListMap.has(data.channelId)}
            showMenu
          />
        )}
        overscan={0} // 0이상일시 maximum call stack size exceeded 에러 발생
        endReached={handleInfinityScroll}
      />
    </section>
  );
}

const ScrollFooter: GridComponents<{ isLoading: boolean }>["Footer"] = ({
  context,
}) => {
  return (
    <div className={css.scrollFooter}>
      {context?.isLoading && <Loader color={variable.secondColorDefault} />}
    </div>
  );
};
