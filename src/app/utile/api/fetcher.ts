import { fetchTokenReissue } from "./LoginApi";

export interface FetcherOptions extends Omit<RequestInit, "headers"> {
    token?: string;           // 토큰 직접 지정 (기본: localStorage)
    autoJson?: boolean;       // JSON 자동 파싱 여부 (기본: true)
    silent?: boolean;         // 에러 로그 출력 여부 (기본: false)
    headers?: Record<string, string>; // 커스텀 헤더
}

const API_BASE = "http://localhost:8082"; // or your production base URL

export async function fetcher<T>(
    url: string,
    options: FetcherOptions = {}
): Promise<T> {
    const {
        token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "",
        autoJson = true,
        silent = false,
        headers = {},
        ...restOptions
    } = options;

    const makeRequest = async (currentToken: string) => {
        const finalHeaders: Record<string, string> = { ...headers };
    
        if (!(restOptions.body instanceof FormData)) {
          finalHeaders["Content-Type"] = "application/json";
        }
    
        if (currentToken) {
          finalHeaders["Authorization"] = `Bearer ${currentToken}`;
        }
    
        return fetch(`${API_BASE}${url}`, {
          headers: finalHeaders,
          ...restOptions,
        });
    };    

    let response = await makeRequest(token);

    // 401 Unauthorized → 토큰 재발급 시도
    if (response.status === 401) {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("리프레시 토큰 없음");
      
            const res = await fetchTokenReissue({ refreshToken });
            const newAccessToken = res.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
      
            response = await makeRequest(newAccessToken); 
        } catch (error) {
            console.error("토큰 재발급 및 재요청 실패", error);
            throw new Error("인증 실패. 다시 로그인 해주세요.");
        }
    }

    // 최종 응답 체크
    if (!response.ok) {
        let message = `API Error: ${response.status}`;

        try {
            const data = await response.json();
            message = data?.message || JSON.stringify(data);
        } catch (error: unknown) {
            if (!silent) {
                console.warn("[fetcher] 응답을 JSON으로 파싱하지 못했습니다.");
                console.warn(error);
            }
            message = `API Error: ${response.statusText || "Unknown Error"}`;
        }

        if (!silent) console.error("[fetcher]", message);
        throw new Error(message);
    }

    if (response.status === 204) return null as T;

    return autoJson ? response.json() : (response as unknown as T);
}