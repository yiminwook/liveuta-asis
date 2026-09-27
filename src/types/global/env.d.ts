declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly TZ?: string;

      readonly NEXT_PUBLIC_MSW_ENABLED: 'true' | 'false' | undefined;

      // vercel env  - https://vercel.com/docs/projects/environment-variables/system-environment-variables
      // readonly NEXT_PUBLIC_VERCEL_ENV: 'production' | 'preview' | 'development';
      // readonly NEXT_PUBLIC_VERCEL_URL: string; // *.vercel.app
      // readonly NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG: string; // main or dev

      readonly NEXT_PUBLIC_SITE_URL: string;

      readonly ACCESS_SECRET: string;

      readonly GOOGLE_API_KEY: string;
      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;

      readonly FIREBASE_PROJECT_ID: string;
      readonly FIREBASE_PRIVATE_KEY: string;
      readonly FIREBASE_CLIENT_EMAIL: string;
      readonly NEXT_PUBLIC_FIREBASE_VAPID_KEY: string;

      readonly MONGODB_URI: string;

      readonly ORACLEDB_CONNECTSTRING: string;
      readonly ORACLEDB_PASSWORD: string;

      readonly NEXT_PUBLIC_SENTRY_DSN?: string;
      readonly SENTRY_AUTH_TOKEN?: string;

      /** 미사용 */
      readonly HOLODEX_API_KEY: string;

      readonly EXTERNAL_API_URL: string;
      readonly EXTERNAL_API_KEY: string;
    }
  }
}

export {};
