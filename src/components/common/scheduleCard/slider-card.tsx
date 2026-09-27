import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Flex,
  Text,
  Tooltip,
} from "@mantine/core";
import variable from "@variable";
import { Ban, SquareArrowOutUpRight, Star, Users } from "lucide-react";
import { useTranslations } from "@/libraries/i18n/client";
import {
  STREAM_STATUS_MAPPER,
  TEndpointChannel,
  TParsedClientContent,
} from "@/libraries/endpoint/type";
import {
  generateChanneImagelUrl,
  generateVideoUrl,
} from "@/libraries/youtube/url";
import CopyButton from "../button/CopyButton";
import CardImage from "./card-image";
import css from "./slider-card.module.scss";

type SliderCardProps = {
  content: TParsedClientContent;
  channel: TEndpointChannel | undefined;
  isFavorite?: boolean;
  addAlarm?: (
    item: TParsedClientContent,
    channel: TEndpointChannel | undefined,
  ) => void;
  openNewTab?: (item: TParsedClientContent) => void;
  toggleFavorite?: (item: TParsedClientContent) => void;
  addBlock?: (item: TParsedClientContent) => void;
  copy?: (item: TParsedClientContent) => void;
};

export default function SliderCard({
  content,
  channel,
  isFavorite = false,
  addAlarm,
  openNewTab,
  toggleFavorite,
  addBlock,
}: SliderCardProps) {
  const { t } = useTranslations();

  const onClickAlarm = () => {
    addAlarm?.(content, channel);
  };

  const onClickFavorite = () => {
    toggleFavorite?.(content);
  };

  const onClickNewTab = () => {
    openNewTab?.(content);
  };

  const onClickBlock = () => {
    addBlock?.(content);
  };

  return (
    <Card className={css.sliderCard} padding="xs" shadow="xs" withBorder>
      <Card.Section>
        <CardImage content={content} />
        <Badge
          className={css.status}
          size="md"
          data-status={STREAM_STATUS_MAPPER[content.broadcastStatus]}
          color={variable.thirdColorDefault}
          leftSection={
            content.broadcastStatus === "TRUE" && (
              <Users color="#fff" size="0.85rem" />
            )
          }
        >
          {content.broadcastStatus === "TRUE"
            ? new Intl.NumberFormat("kr", { notation: "compact" })
                .format(content.viewer)
                .toLowerCase()
            : STREAM_STATUS_MAPPER[content.broadcastStatus]}
        </Badge>
      </Card.Section>

      <Flex mt="xs" align="center">
        <Avatar
          display="inline-block"
          mr={5}
          styles={{ root: { verticalAlign: "text-bottom" } }}
          size="sm"
          src={
            channel?.profile_picture_url
              ? generateChanneImagelUrl(channel.profile_picture_url, {
                  size: 40,
                })
              : ""
          }
        />
        <Text fw={500} className={css.channelNm} component="span" lineClamp={1}>
          {channel?.name_kor}
        </Text>
      </Flex>

      <div className={css.titleBox}>
        <span className={css.title}>{content.title}</span>
      </div>
      <div className={css.navBox}>
        <div>
          {/* <Tooltip label={t('home.sliderCard.setNotification')} position="bottom" withArrow>
            <ActionIcon variant="transparent" onClick={onClickAlarm}>
              <TbBellRingingFilled color={variable.thirdColorDefault} />
            </ActionIcon>
          </Tooltip> */}
          <Tooltip
            label={`${t("home.sliderCard.favorite")} ${isFavorite ? t("home.sliderCard.remove") : t("home.sliderCard.add")}`}
            position="bottom"
            withArrow
          >
            <ActionIcon variant="transparent" onClick={onClickFavorite}>
              <Star
                color={isFavorite ? "#ffbb00" : "#a7a7a7"}
                fill={isFavorite ? "#ffbb00" : "#a7a7a7"}
              />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={t("home.sliderCard.blockChannel")}
            position="bottom"
            withArrow
          >
            <ActionIcon variant="transparent" onClick={onClickBlock}>
              <Ban color={variable.thirdColorDefault} />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={t("home.sliderCard.openInNewTab")}
            position="bottom"
            withArrow
          >
            <ActionIcon variant="transparent" onClick={onClickNewTab}>
              <SquareArrowOutUpRight color={variable.thirdColorDefault} />
            </ActionIcon>
          </Tooltip>
          <CopyButton value={generateVideoUrl(content.videoId)} />
        </div>
      </div>
    </Card>
  );
}
