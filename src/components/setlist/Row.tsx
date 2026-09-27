/* eslint-disable @next/next/no-img-element */
"use client";
import { useLocale, useTranslations } from "@/libraries/i18n/client";
import { TEndpointChannel } from "@/libraries/endpoint/type";
import type { Setlist } from "@/libraries/oracledb/setlist/service";
import { generateThumbnail } from "@/libraries/youtube/url";
import { replaceParentheses } from "@/utils/regexp";
import { useRouter } from "@bprogress/next";
import { Table } from "@mantine/core";
import clsx from "clsx";
import dayjs from "dayjs";
import { type MouseEvent } from "react";
import { useDrawerActions } from "./DrawerContext";
import css from "./Table.module.scss";

type RowProps = {
  setlist: Setlist;
  channel?: TEndpointChannel;
  order?: "broadcast" | "create";
};

export default function Row({ setlist, channel, order }: RowProps) {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useTranslations();
  const thumbnailUrl = generateThumbnail(setlist.videoId, "mqdefault");
  const title = replaceParentheses(setlist.title);
  const create = dayjs(setlist.createdAt).format(t("time.shortTemplate"));
  const broad = dayjs(setlist.broadcastAt).format(t("time.shortTemplate"));
  const drawerActions = useDrawerActions();

  const handleImageClick = (e: MouseEvent) => {
    e.stopPropagation();
    router.push(`/${locale}/setlist/${setlist.videoId}`);
  };

  const handleRowClick = () => {
    drawerActions.open(setlist, thumbnailUrl, channel);
  };

  return (
    <Table.Tr className={css.row} onClick={handleRowClick}>
      <Table.Td className={clsx(css.cell, css.thumbnail)}>
        <button className={css.thumbnailButton} onClick={handleImageClick}>
          <div className={css.thumbnailBox}>
            <img src={thumbnailUrl} alt={setlist.title} loading="lazy" />
          </div>
        </button>
      </Table.Td>
      <Table.Td className={clsx(css.cell, css.channel)}>
        <p>{channel?.name_kor}</p>
      </Table.Td>
      <Table.Td className={clsx(css.cell, css.title)}>
        <p>{title}</p>
      </Table.Td>
      <Table.Td className={clsx(css.cell, css.time)}>
        <p>{order ? create : broad}</p>
      </Table.Td>
    </Table.Tr>
  );
}
