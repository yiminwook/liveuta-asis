import { serverApi } from "@/apis/fetcher";
import Footer from "@/components/common/Footer";
import { CHANNELS_TAG, METADATAS_TAG } from "@/constants/revalidate-tag";
import { TYChannelReturn } from "@/libraries/endpoint/type";
import { TMetadata } from "@/types";
import Client from "./page.client";

export default async function Page() {
  const [metadata, recentChannelData] = await Promise.all([
    serverApi
      .get<{ data: TMetadata }>("v1/metadata", {
        next: { revalidate: 3600, tags: [METADATAS_TAG] },
      })
      .json()
      .then((json) => json.data),
    serverApi
      .get<{ data: TYChannelReturn }>(
        "v1/youtube-channel?page=1&sort=createdAt&size=20",
        {
          next: { revalidate: 1800, tags: [CHANNELS_TAG] },
        },
      )
      .json()
      .then((json) => json.data),
  ]);

  return (
    <>
      <Client
        coverImgUrl={metadata.cover_image_url}
        recentChannels={recentChannelData.contents}
      />
      <Footer />
    </>
  );
}
