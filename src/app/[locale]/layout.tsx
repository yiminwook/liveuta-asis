import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getQueryClient } from "@/apis/cached";
import { serverApi } from "@/apis/fetcher";
import BottomTab from "@/components/common/bottomTab/BottomTab";
import DataFetchingObserver from "@/components/common/DataFetchingObserver";
import Header from "@/components/common/header/header";
import PageView from "@/components/common/PageView";
import AccountSidebar from "@/components/common/sidebar/Account";
import Document from "@/components/config/document";
import { CHANNELS_TAG } from "@/constants/revalidate-tag";
import { FALLBACK_LANG, LANGUAGES } from "@/libraries/i18n/config";
import { TLocaleCode } from "@/libraries/i18n/type";
import { TGetChannelRes } from "@/libraries/endpoint/type";

const checkIsRoutingLocale = (locale: string): locale is TLocaleCode => {
  return LANGUAGES.includes(locale as TLocaleCode);
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout(props: Props) {
  const params = await props.params;
  const locale = params.locale;

  if (!checkIsRoutingLocale(locale)) {
    redirect(`/${FALLBACK_LANG}/not-found`);
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [CHANNELS_TAG],
    queryFn: () =>
      serverApi
        .get<TGetChannelRes>("v1/channel", {
          next: { revalidate: 1800, tags: [CHANNELS_TAG] },
        })
        .json()
        .then((json) => json.data),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <Document locale={locale}>
      <HydrationBoundary state={dehydratedState}>
        <DataFetchingObserver locale={locale} />
        <PageView>
          <Header locale={locale} />
          <>{props.children}</>
          <BottomTab locale={locale} />
          <AccountSidebar />
        </PageView>
      </HydrationBoundary>
    </Document>
  );
}
