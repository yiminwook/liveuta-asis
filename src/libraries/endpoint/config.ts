"server-only";
import crypto from "crypto";
import ky from "ky";

export const VERSION = "v1";

/**
 * @param limit - default 20, max 50
 * @param page - default 1
 */
export const GET_VIDEOS = {
  live: "videos/live", // 현재 진행 중인 라이브 영상 목록
  upcoming: "videos/upcoming", // 예정된 라이브 영상 목록
  all: "videos/all", // 전체 영상 목록
};

export const GET_CHANNELS = {
  index: "channels", // 전체 채널
  meta: "channels/meta", // 채널 메타 정보
  paginated: "channels/paginated", // 채널 목록 (페이징)
  count: "channels/count", // 채널 개수
  waiting: "channels/waiting", // 채널 대기 목록
  search: "channels/search", // 채널 검색 sort=createdAt&direction=asc
};

export const POST_CHANNELS = {
  checkDuplicates: "channels/check-duplicates",
  requests: "channels/requests",
};

export const CHANNEL_ORDER_MAP = {
  createdAt: "desc", // 최신순
  name_kor: "asc", // 이름순
} as const;

export const GET_FEATURED = {
  index: "featured", // 추천/주요 콘텐츠 조회
};

/**
 * 서명은 매 요청마다 실시간으로 생성해야 합니다.
 * 서버 시각과 타임스탬프의 차이가 300초(5분) 이상 벌어지면 `401 Unauthorized`가 반환됩니다.
 */
const getTimestamp = () => {
  return Math.floor(Date.now() / 1000).toString();
};

/**
 * Message 포맷: `${timestamp}.${body}`
 * GET 요청은 Body가 비어 있으므로 `body`는 빈 문자열(`""`) 처리되어 `${timestamp}.` 형태가 됩니다. (예: `"1756032000."`)
 * Signature 계산: `HMAC_SHA256(EXTERNAL_API_KEY, message)` -> 소문자 hex 변환
 * 클라이언트(브라우저)에서 직접 서명하면 EXTERNAL_API_KEY가 노출됩니다.
 */
const hmac = (args: { timestamp: string; bodyString: string }) => {
  const signature = crypto
    .createHmac("sha256", process.env.EXTERNAL_API_KEY)
    .update(`${args.timestamp}.${args.bodyString}`)
    .digest("hex");

  return signature;
};

export const endpointApi = ky.create({
  prefixUrl: `${process.env.EXTERNAL_API_URL}/api/${VERSION}`,
  hooks: {
    beforeRequest: [
      async (request) => {
        try {
          const body = !!request.body ? await request.clone().text() : "";
          const timestamp = getTimestamp();
          const signature = hmac({ timestamp, bodyString: body });

          request.headers.set("X-Signature", signature); // UNIX 타임스탬프 (초 단위, 문자열)
          request.headers.set("X-Timestamp", timestamp); // HMAC-SHA256 해시값 (소문자 hex 문자열)
        } catch (error) {
          console.log("[SERVER] error", error);
        }
      },
    ],
    beforeRetry: [],
    afterResponse: [],
    beforeError: [
      async (error) => {
        const { response } = error;
        if (!response) return error;

        try {
          const body: { message?: string } = await response.json();

          if (body?.message) {
            error.message = body.message;
          }
          console.log("[SERVER] ky parseError", body);
        } catch (parseError) {
          console.log("[SERVER] ky parseError");
        } finally {
          return error;
        }
      },
    ],
  },
});
