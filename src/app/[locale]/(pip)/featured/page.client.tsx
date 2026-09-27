"use client";
import { Button, ButtonGroup } from "@mantine/core";
import clsx from "clsx";
import { useMemo } from "react";
import { toast } from "sonner";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import RankingTable from "@/components/featured/RankingTable";
import useCachedData from "@/hooks/use-cached-data";
import useMutateWhitelist from "@/hooks/use-delete-whitelist";
import { useMount } from "@/hooks/use-mount";
import usePostBlacklist from "@/hooks/use-post-blacklist";
import usePostWhitelist from "@/hooks/use-post-whitelist";
import dayjs from "@/libraries/dayjs";
import { useTranslations } from "@/libraries/i18n/client";
import { TFeaturedDataAPIReturn } from "@/libraries/endpoint/type";
import { useSession } from "@/stores/session";
import { TYChannelsData } from "@/types/api/youtube";
import { combineYTData } from "@/utils/combineChannelData-v2";
import css from "./page.module.scss";

type Props = {
  featuredData: TFeaturedDataAPIReturn;
};

export default function Client({ featuredData }: Props) {
  const { t } = useTranslations();

  const session = useSession((state) => state.session);
  const { channelMap, whiteListMap } = useCachedData({ session });
  const mutateBlock = usePostBlacklist();
  const mutatePostFavorite = usePostWhitelist();
  const mutateDeleteFavorite = useMutateWhitelist();

  const handleFavorite = (content: TYChannelsData) => {
    if (!session) {
      toast.error(t("featured.notLoggedInError"));
      return;
    }

    const isFavorite = whiteListMap.has(content.uid);

    if (!isFavorite && confirm(t("featured.addFavoriteChannel"))) {
      mutatePostFavorite.mutate({
        channelId: content.uid,
        email: session.email,
      });
    } else if (isFavorite && confirm(t("featured.removeFavoriteChannel"))) {
      mutateDeleteFavorite.mutate({
        channelId: content.uid,
        email: session.email,
      });
    }
  };

  const handleBlock = (content: TYChannelsData) => {
    if (!session) {
      toast.error(t("featured.notLoggedInError"));
      return;
    }

    if (confirm(t("featured.blockChannel"))) {
      mutateBlock.mutate({ channelId: content.uid, email: session.email });
    }
  };

  const isFavorite = (channelId: string) => whiteListMap.has(channelId);

  const combinedData = useMemo(() => {
    return {
      promising: combineYTData(channelMap, featuredData.promising),
      topRating: combineYTData(channelMap, featuredData.topRating),
    };
  }, [featuredData, channelMap]);

  return (
    <div className={css.container}>
      <p className={clsx("essential", css.essential)}>
        {t("featured.essential")}&nbsp;
        <TimeBox featuredData={featuredData} />
      </p>
      <div>
        <ButtonGroup>
          <Button className="swiper-prev" size="xs">
            이전
          </Button>
          <Button className="swiper-next" size="xs">
            다음
          </Button>
        </ButtonGroup>
      </div>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".swiper-next",
          prevEl: ".swiper-prev",
        }}
        pagination={{ clickable: true }}
        className={css.swiper}
      >
        <SwiperSlide>
          <RankingTable
            title={t("featured.topRating")}
            data={combinedData.topRating}
            onFavorite={handleFavorite}
            onBlock={handleBlock}
          />
        </SwiperSlide>
        <SwiperSlide>
          <RankingTable
            title={t("featured.promising")}
            data={combinedData.promising}
            onFavorite={handleFavorite}
            onBlock={handleBlock}
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

function TimeBox({ featuredData }: { featuredData: TFeaturedDataAPIReturn }) {
  const isMounted = useMount();

  if (!isMounted) return null;

  return (
    <time>({dayjs(featuredData.lastUpdateAt).format("YYYY-MM-DD HH:mm")})</time>
  );
}
