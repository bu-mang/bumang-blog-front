import { END_POINTS } from "@/constants/api/endpoints";
import axios from "axios";

const ClientInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
ClientInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 브라우저에서 API를 직접 부르다 access 토큰 만료(401)를 만났을 때의 갱신.
// 페이지 이동은 미들웨어가 갱신하지만, 한 화면에 오래 머물다 요청하는 경우
// (글을 오래 쓰다 저장 등)는 미들웨어를 거치지 않으므로 여기가 맡는다.

// 동시에 여러 요청이 401을 받아도 토큰 갱신은 한 번만 (single-flight)
let refreshPromise: Promise<unknown> | null = null;

// 응답 인터셉터
ClientInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    // 갱신(또는 갱신 실패) 후 다시 보낸 요청도 401이면 로그인이 필요한 요청이다.
    if (error.config._retry) {
      window.location.href = "/";
      return Promise.reject(error);
    }
    error.config._retry = true;

    try {
      // 토큰 갱신 - 일반 axios 사용. 진행 중인 갱신이 있으면 그것을 공유한다.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            (process.env.NEXT_PUBLIC_API_BASE_URL as string) +
              END_POINTS.POST_RENEW_ACCESS_TOKEN,
            {},
            {
              withCredentials: true,
              timeout: 10000,
            },
          )
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;
    } catch (refreshError) {
      // 세션이 죽은 경우 백엔드가 갱신 응답에서 쿠키를 지운다. 그 상태로 한 번 더 보내면
      // 로그인 없이도 되는 요청(공개 글 조회 등)은 익명으로 성공한다. 그 외의 실패
      // (네트워크·서버 오류)는 원래 에러를 그대로 돌려준다.
      if (
        !axios.isAxiosError(refreshError) ||
        refreshError.response?.status !== 401
      ) {
        return Promise.reject(error);
      }
    }

    return ClientInstance(error.config);
  },
);

export default ClientInstance;
