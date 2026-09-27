import { Divider } from "@mantine/core";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getChannelById, parseChannel } from "@/libraries/endpoint/service";
import { getSetlistByVideoId } from "@/libraries/oracledb/setlist/service";
import character from "/public/assets/character-5-150.png";
import Background from "../common/background/Background";
import Desc from "./desc";
import css from "./home.module.scss";
import Info from "./info";
import SetlistPlayer from "./setlist-player";

interface HomeProps {
  params: {
    id: string;
  };
}

export default async function Home({ params }: HomeProps) {
  const data = await getSetlistByVideoId(params.id);
  if (!data) notFound();
  const setlist = data.setlist;
  const icon = data.channelIcon;
  const document = await getChannelById(setlist.channelId);
  const channel = parseChannel(document);
  return (
    <Background>
      <div className={css.inner}>
        <section className={css.left}>
          <Image
            className={css.character}
            src={character}
            alt="캐릭터 이미지"
            width={150}
            height={224}
            unoptimized={true}
          />
          <div className={css.playerWrap}>
            <SetlistPlayer videoId={setlist.videoId} />
          </div>
          <div className={css.infoWrap}>
            <Info setlist={setlist} channel={channel} icon={icon} />
          </div>
        </section>
        <Divider className={css.divider} orientation="horizontal" />
        <section className={css.right}>
          <Desc videoId={setlist.videoId} description={setlist.description} />
        </section>
      </div>
    </Background>
  );
}
