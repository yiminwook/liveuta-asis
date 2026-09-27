"use client";
import { Avatar, Button } from "@mantine/core";
import useMutateWhitelist from "@/hooks/use-delete-whitelist";
import { useTranslations } from "@/libraries/i18n/client";
import { TEndpointChannel } from "@/libraries/endpoint/type";
import { generateChanneImagelUrl } from "@/libraries/youtube/url";
import css from "./List.module.scss";

type WhitelistProps = {
  whiteList: Set<string>;
  channelList: Record<string, TEndpointChannel>;
  session: TSession;
};

export default function Whitelist({
  whiteList,
  channelList,
  session,
}: WhitelistProps) {
  const { t } = useTranslations();

  const mutationDelete = useMutateWhitelist();

  const handleClick = (channelId: string) => {
    if (confirm(t("my.favorite.removeFavorite"))) {
      mutationDelete.mutate({ channelId, email: session.email });
    }
  };

  const data = [...whiteList]
    .map<TEndpointChannel>((item) => channelList[item])
    .filter((item) => !!item)
    .sort((a, b) => a.name_kor.localeCompare(b.name_kor));

  return (
    <div className={css.wrap}>
      <ul className={css.list}>
        {data.map((item) => (
          <li key={item.channel_id} className={css.row}>
            <div className={css.channelBox}>
              <Avatar
                size="md"
                mr="0.85rem"
                src={generateChanneImagelUrl(item.profile_picture_url, {
                  size: 40,
                })}
              />
              <span className={css.text}>{item.name_kor}</span>
            </div>
            <Button
              size="xs"
              fz="0.95rem"
              onClick={() => handleClick(item.channel_id)}
              loading={mutationDelete.isPending}
            >
              {t("my.favorite.remove")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
