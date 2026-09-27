import { TChannelRecord } from "@/libraries/endpoint/type";
import { generateChannelUrl } from "@/libraries/youtube/url";
import { TYChannelsData } from "@/types/api/youtube";
import { youtube_v3 } from "googleapis";

// refactor
export const combineYTData = (
  channelData: TChannelRecord,
  youtubeData: youtube_v3.Schema$Channel[],
) => {
  return youtubeData.reduce<TYChannelsData[]>((acc, curr) => {
    const id = curr.id;
    const channel = channelData[id!];
    if (!(id && channel)) return acc;
    const { channel_id, name_kor, createdAt, alive } = channel;
    const youtubeChannelUrl = generateChannelUrl(channel_id);

    acc.push({
      ...curr,
      uid: channel_id,
      nameKor: name_kor,
      createdAt,
      url: youtubeChannelUrl,
      alive,
    });
    return acc;
  }, []);
};
