import { ActionIcon, Avatar } from "@mantine/core";
import clsx from "clsx";
import { useTranslations } from "@/libraries/i18n/client";
import {
  TEndpointChannel,
  TParsedClientContent,
} from "@/libraries/endpoint/type";
import {
  generateChanneImagelUrl,
  generateThumbnail,
} from "@/libraries/youtube/url";
import css from "./grid-nav.module.scss";

type Props = {
  content: TParsedClientContent;
  channel: TEndpointChannel | undefined;
  onAddById: (videoId: string) => void;
};

export default function GridNavItem({ content, channel, onAddById }: Props) {
  const { t } = useTranslations();

  const time = content.utcTime.format(t("time.longTemplate"));

  const channelImage = channel?.profile_picture_url
    ? generateChanneImagelUrl(channel.profile_picture_url, {
        size: 40,
      })
    : generateThumbnail(content.videoId, "mqdefault");

  return (
    <div className={css.listItem}>
      <div className={css.listItemHeader}>
        <div className={css.listItemHeaderLeft}>
          <Avatar className={css.avatar} size="md" src={channelImage} />
          <div>
            <span className={clsx(css.channelName, css.line)}>
              {channel?.name_kor}
            </span>
            {content.viewer > 0 && (
              <span
                className={css.line}
              >{`${t("multiView.0007")}: ${content.viewer}`}</span>
            )}
          </div>
        </div>
        <ActionIcon variant="light" onClick={() => onAddById(content.videoId)}>
          +
        </ActionIcon>
      </div>
      <time className={css.line}>{time}</time>
      <p className={css.title}>{content.title}</p>
    </div>
  );
}
