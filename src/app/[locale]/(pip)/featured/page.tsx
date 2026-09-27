import { serverApi } from "@/apis/fetcher";
import { FEATURED_TAG } from "@/constants/revalidate-tag";
import { TFeaturedDataAPIReturn } from "@/libraries/endpoint/type";
import Client from "./page.client";

export default async function Page() {
  const json = await serverApi
    .get<{ data: TFeaturedDataAPIReturn; message: string }>("v1/featured", {
      // next: { revalidate: 86400, tags: [FEATURED_TAG] },
      cache: "no-store",
    })
    .json();

  return <Client featuredData={json.data} />;
}
