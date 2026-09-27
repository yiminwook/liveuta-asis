"use client";
import { Avatar, Button } from "@mantine/core";
import useDeleteBlacklist from "@/hooks/use-delete-blacklist";
import { useTranslations } from "@/libraries/i18n/client";
import { TEndpointChannel } from "@/libraries/endpoint/type";
import { generateChanneImagelUrl } from "@/libraries/youtube/url";
import css from "./List.module.scss";

type BlacklistProps = {
  channelList: Record<string, TEndpointChannel>;
  blacklist: Set<string>;
  session: TSession;
};

export default function Blacklist({
  channelList,
  blacklist,
  session,
}: BlacklistProps) {
  const mutationDelete = useDeleteBlacklist();
  const { t } = useTranslations();

  const handleClick = (channelId: string) => {
    if (confirm(t("my.blacklist.removeBlacklist"))) {
      mutationDelete.mutate({ channelId, email: session.email });
    }
  };

  const data = [...blacklist]
    .map<TEndpointChannel>((item) => channelList[item])
    .filter((item) => !!item)
    .sort((a, b) => a.name_kor.localeCompare(b.name_kor)); //TODO: 점검필요

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
              {t("my.blacklist.remove")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
