import path from "node:path";
import NextBundleAnalyzer from "@next/bundle-analyzer";
import { SentryBuildOptions, withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// const isDevelopment = process.env.NODE_ENV !== 'production';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.NODE_ENV === "production",
  analyzerMode: "static",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  output: process.env.ENABLE_STANDALONE === "true" ? "standalone" : undefined,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true, // biome 에러발생시 주석 해제
  },
  typescript: {
    // !! WARN !!
    // ts빌드 에러를 무시하고 싶다면 아래 옵션을 true로 변경하세요.
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  compiler: {
    // removeConsole: {
    //   exclude: ['error', 'warn', 'log', 'info'],
    // },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "src", "styles")], // style 폴더에 있는 파일은 이름만으로 import 가능(경로 축약)
    prependData: `
      @use "var";
      @use "util";
      @use "placeholder";
    `, // 위 파일은 import 하지 않아도 된다.
    silenceDeprecations: ["legacy-js-api"], // sass warning 제거
    logger: {
      warn: (message: any) => console.warn(message),
      debug: (message: any) => console.log(message),
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ytimg.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_SITE_URL,
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // 이전되었음.
      // {
      //   source: '/proxy/append-new-vchan/:path*',
      //   destination: 'https://append-new-vchan.vercel.app/api/:path*',
      // },
    ];
  },
  webpack: (config, { isServer }) => {
    /**
     * oracledb
     * These packages need to be added as external, else Oracle DB will try to load them due to a
     * Webpack bug.
     *
     * https://github.com/oracle/node-oracledb/issues/1691
     *
     * See these two issues for more information:
     * - https://github.com/oracle/node-oracledb/issues/1688
     * - https://github.com/oracle/node-oracledb/issues/1691
     **/
    config.externals.push(
      ...[
        "@azure/app-configuration",
        "@azure/identity",
        "@azure/keyvault-secrets",
        "oci-common",
        "oci-objectstorage",
        "oci-secrets",
      ],
    );

    /** SVGR **/
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg"),
    );
    fileLoaderRule.exclude = /\.svg$/i;
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: false, // viewBox 유지
            },
          },
        ],
      },
    );

    /** MSW **/
    if (isServer) {
      // next server build => ignore msw/browser
      if (Array.isArray(config.resolve.alias)) {
        // in Next the type is always object, so this branch isn't necessary. But to keep TS happy, avoid @ts-ignore and prevent possible future breaking changes it's good to have it
        config.resolve.alias.push({ name: "msw/browser", alias: false });
      } else {
        config.resolve.alias["msw/browser"] = false;
      }
    } else {
      // browser => ignore msw/node
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: "msw/node", alias: false });
      } else {
        config.resolve.alias["msw/node"] = false;
      }
    }

    return config;
  },
  experimental: {
    authInterrupts: true, // 401, 403
    reactCompiler: true,
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"], // tree shaking
  },
};

const isEnableSentry =
  !!process.env.NEXT_PUBLIC_SENTRY_DSN && !!process.env.SENTRY_AUTH_TOKEN;

const SENTRY_BUILD_OPTIONS: SentryBuildOptions = {
  silent: !isEnableSentry, // Can be used to suppress logs
  org: "yisp",
  project: "liveuta",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false, // Sentry 서비스 개선에 활용되지 않도록 설정
  autoInstrumentMiddleware: false,
  autoInstrumentAppDirectory: true,
  autoInstrumentServerFunctions: true,
  sourcemaps: {
    disable: true,
  },
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  SENTRY_BUILD_OPTIONS,
);
