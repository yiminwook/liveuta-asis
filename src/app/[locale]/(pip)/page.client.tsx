"use client";
import { useRouter } from "@bprogress/next";
import Image from "next/image";
import { useMemo, useState } from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import { toast } from "sonner";
import MoreButton from "@/components/common/button/MoreButton";
import SearchInput from "@/components/common/input/SearchInput";
import ChannelSlider from "@/components/home/channel-slider";
import ScheduleSlider from "@/components/home/schedule-slider";
import useCachedData from "@/hooks/use-cached-data";
import useMutateWhitelist from "@/hooks/use-delete-whitelist";
import usePostBlacklist from "@/hooks/use-post-blacklist";
import usePostWhitelist from "@/hooks/use-post-whitelist";
import useReservePush from "@/hooks/use-reserve-push";
import { useScheduleQuery } from "@/hooks/use-schedule";
import { Link } from "@/libraries/i18n";
import { useLocale, useTranslations } from "@/libraries/i18n/client";
import { useCustomMantineColorScheme } from "@/libraries/mantine/custom-theme-hook";
import { TParsedClientContent } from "@/libraries/endpoint/type";
import { generateVideoUrl } from "@/libraries/youtube/url";
import { useSetModalStore } from "@/stores/modal";
import { useSession } from "@/stores/session";
import { TYChannelsData } from "@/types/api/youtube";
import { gtagClick } from "@/utils/gtag";
import { openWindow } from "@/utils/window-event";
import character9 from "/public/assets/character-9.png";
import css from "./page.module.scss";

type Props = {
  coverImgUrl: string;
  recentChannels: TYChannelsData[];
};

export default function Client({ coverImgUrl, recentChannels }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useTranslations();

  const [query, setQuery] = useState("");

  const modalStore = useSetModalStore();
  const session = useSession((state) => state.session);
  const { whiteListMap, blackListMap, channelMap } = useCachedData({
    session: session,
  });
  const { data, isPending } = useScheduleQuery({
    enableAutoSync: false,
    locale,
  });

  const onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(() => e.target.value);
  };

  const onSearch = () => {
    const trimmedQuery = query.trim();
    const params = new URLSearchParams();
    params.set("q", trimmedQuery);
    params.set("t", "all");
    router.push(`/${locale}/schedule?${params.toString()}`);
  };

  const mutateBlock = usePostBlacklist();
  const mutatePostFavorite = usePostWhitelist();
  const mutateDeleteFavorite = useMutateWhitelist();
  const { reservePush } = useReservePush();

  const handleFavorite = (content: TParsedClientContent) => {
    if (!session) {
      toast.error(t("home.notLoggedInError"));
      return;
    }

    const isFavorite = whiteListMap.has(content.channelId);

    if (!isFavorite && confirm(t("home.addFavoriteChannel"))) {
      mutatePostFavorite.mutate({
        channelId: content.channelId,
        email: session.email,
      });
    } else if (isFavorite && confirm(t("home.removeFavoriteChannel"))) {
      mutateDeleteFavorite.mutate({
        channelId: content.channelId,
        email: session.email,
      });
    }
  };

  const handleBlock = async (content: TParsedClientContent) => {
    if (!session) {
      toast.error(t("home.notLoggedInError"));
      return;
    }

    if (confirm(t("home.blockChannel"))) {
      mutateBlock.mutate({
        channelId: content.channelId,
        email: session.email,
      });
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

  const proceedScheduleData = useMemo(() => {
    if (!data) {
      return {
        liveContent: [],
        favoriteContent: [],
      };
    }

    const liveContent = data.live
      .filter((i) => !blackListMap.has(i.channelId))
      .slice(0, 19)
      .map((i) => ({ ...i, isFavorite: whiteListMap.has(i.channelId) }));

    const favoriteContent = data.all
      .slice() // copy
      .reverse()
      .filter((i) => whiteListMap.has(i.channelId))
      .slice(0, 19)
      .map((i) => ({ ...i, isFavorite: true }));

    return {
      liveContent,
      favoriteContent,
    };
  }, [data, whiteListMap, blackListMap]);

  return (
    <main className={css.homeMain}>
      <section className={css.heroSection}>
        <div className={css.coverImageBox}>
          <Image className="blur" src={coverImgUrl} alt="blur-image" fill />
          <Image src={coverImgUrl} alt="cover-image" fill />
        </div>
      </section>

      {!!session && !isPending && (
        <section className={css.favoriteSection}>
          <div className={css.favoriteNav}>
            <h2>🌟 {t("home.favorite")}</h2>
            <MoreButton
              component={Link}
              locale={locale}
              href="/schedule?isFavorite=true"
            />
          </div>
          <ScheduleSlider
            contents={proceedScheduleData.favoriteContent}
            channelMap={channelMap}
            addAlarm={reservePush}
            openNewTab={openStream}
            addBlock={handleBlock}
            toggleFavorite={handleFavorite}
          />
        </section>
      )}

      <section className={css.liveSection}>
        <div className={css.liveNav}>
          <h2>
            🎤 <span className={css.highlight}>{t("home.live")}</span>
          </h2>
          <MoreButton
            component={Link}
            locale={locale}
            href="/schedule?t=live"
          />
        </div>
        <ScheduleSlider
          contents={proceedScheduleData.liveContent}
          channelMap={channelMap}
          addAlarm={reservePush}
          openNewTab={openStream}
          addBlock={handleBlock}
          toggleFavorite={handleFavorite}
          isLoading={isPending}
        />
      </section>

      <section className={css.searchSection}>
        <div className={css.searchNav}>
          <div />
          <h2>{t("home.searchSchedule")}</h2>
          <MoreButton component={Link} locale={locale} href="/schedule" />
        </div>
        <div className={css.searchBox}>
          <SearchInput
            placeholder={t("home.searchInputPlaceholder")}
            value={query}
            onChange={onChangeQuery}
            onSubmit={onSearch}
          />
        </div>
      </section>

      <section className={css.recentChannelSection}>
        <div className={css.recentChannelNav}>
          <h2>🚚 {t("home.recentlyAddedChannel")}</h2>
          <MoreButton
            component={Link}
            locale={locale}
            href="/channel?sort=createdAt"
          />
        </div>
        <ChannelSlider recentChannels={recentChannels} />
      </section>

      <section className={css.featureSection}>
        <div className={css.featureNav}>
          <h2>✨ {t("home.featured")}</h2>
        </div>
        <Link locale={locale} href="/featured">
          <div className={css.featureBox}>
            <div className={css.featuredContent}>
              <div className={css.patternBg}>
                <svg width="100%" height="100%">
                  <pattern
                    id="pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="2"
                      fill="rgba(255,255,255,0.2)"
                    />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#pattern)" />
                </svg>
                <div className={css.featuredOverlay}>
                  <h3>{t("home.featuredTitle")}</h3>
                  <p>{t("home.featuredDescription")}</p>
                </div>
                <div className={css.characterImage}>
                  <Image src={character9} alt="character" fill priority />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <TweetArticle />
    </main>
  );
}

function TweetArticle() {
  const { mantineColorScheme } = useCustomMantineColorScheme();

  return (
    <article className={css.tweetArticle}>
      <TwitterTimelineEmbed
        sourceType="profile"
        screenName="LeonaShishigami"
        options={{ height: 500 }}
        theme={mantineColorScheme === "light" ? "light" : "dark"}
      />
    </article>
  );
}
