"use client";
import clsx from "clsx";
import { memo } from "react";
import {
  STREAM_STATUS_MAPPER,
  TEndpointChannel,
  TParsedClientContent,
} from "@/libraries/endpoint/type";
import { generateVideoUrl } from "@/libraries/youtube/url";
import css from "./card.module.scss";
import CardDesc from "./card-desc";
import CardImage from "./card-image";
import CardMenu from "./card-menu";

type ScheduleCardProps = {
  classname?: string;
  content: TParsedClientContent;
  channel: TEndpointChannel | undefined;
  session: TSession | null;
  isFavorite?: boolean;
  addAlarm?: (item: TParsedClientContent, channel?: TEndpointChannel) => void;
  openNewTab?: (item: TParsedClientContent) => void;
  toggleFavorite?: (item: TParsedClientContent) => void;
  addBlock?: (item: TParsedClientContent) => void;
  showMenu?: boolean;
};

/** 카드 높이가 항상 일정하도록 해야함!! */
function ScheduleCard_({
  classname,
  content,
  channel,
  isFavorite,
  addAlarm,
  openNewTab,
  toggleFavorite,
  addBlock,
  showMenu = false,
}: ScheduleCardProps) {
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

  const addStreamModifier = STREAM_STATUS_MAPPER[content.broadcastStatus];
  return (
    <div className={clsx(css.card, addStreamModifier, classname)}>
      <CardImage content={content} />
      <CardDesc
        content={content}
        channel={channel}
        addStreamModifier={addStreamModifier}
      />
      {showMenu && (
        <CardMenu
          isFavorite={isFavorite}
          onClickAlarm={onClickAlarm}
          onClickBlock={onClickBlock}
          onClickFavorite={onClickFavorite}
          onClickNewTab={onClickNewTab}
          copyValue={generateVideoUrl(content.videoId)}
        />
      )}
    </div>
  );
}

const ScheduleCard = memo(ScheduleCard_);
export default ScheduleCard;
