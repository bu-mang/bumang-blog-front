import { END_POINTS } from "@/constants/api/endpoints";
import { UserResponseType } from "@/types/user";
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

const tokenRefreshMap = new Map<string, boolean>();

// 응답 인터셉터
ClientInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (error.config._retry) {
      console.log("토큰 갱신 후에도 401 에러 - 로그인 필요");
      window.location.href = "/";
      return Promise.reject(error);
    }

    try {
      // 재시도 플래그 설정
      error.config._retry = true;

      // 토큰 갱신 - 일반 axios 사용
      await axios.post<UserResponseType>(
        (process.env.NEXT_PUBLIC_API_BASE_URL as string) +
          END_POINTS.POST_RENEW_ACCESS_TOKEN,
        {},
        {
          withCredentials: true,
        },
      );

      return ClientInstance(error.config);
    } catch (refreshError) {
      console.log("토큰 갱신 실패");

      return Promise.reject(error);
    }
  },
);

export default ClientInstance;
