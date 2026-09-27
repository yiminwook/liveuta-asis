import { serverApi } from "@/apis/fetcher";
import Background from "@/components/common/background/Background";
import { ITEMS_PER_PAGE } from "@/constants";
import { CHANNELS_TAG } from "@/constants/revalidate-tag";
import { TChannelDto, TYChannelReturn } from "@/libraries/endpoint/type";
import ChannelSection from "./channel-section";
import css from "./Home.module.scss";
import Nav from "./Nav";
import PaginationBox from "./PaginationBox";

type HomeProps = {
  channelDto: TChannelDto;
};

export default async function Home({ channelDto }: HomeProps) {
  const YChannelData = await serverApi
    .get<{ data: TYChannelReturn }>(
      `v1/youtube-channel?page=${channelDto.page}&query=${channelDto.query || ""}&size=${ITEMS_PER_PAGE}&sort=${channelDto.sort}&query-type=${channelDto.queryType || ""}`,
      { next: { revalidate: 1800, tags: [CHANNELS_TAG] } },
    )
    .json()
    .then((json) => json.data);

  return (
    <Background>
      <div className={css.inner}>
        <Nav />
        <ChannelSection contents={YChannelData.contents} />
        <PaginationBox
          totalPage={YChannelData.totalPage}
          currentPage={channelDto.page}
          query={channelDto.query || ""}
        />
      </div>
    </Background>
  );
}
