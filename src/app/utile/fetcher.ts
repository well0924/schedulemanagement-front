export interface FetcherOptions extends Omit<RequestInit, "headers"> {
    token?: string;           // 토큰 직접 지정 (기본: localStorage)
    autoJson?: boolean;       // JSON 자동 파싱 여부 (기본: true)
    silent?: boolean;         // 에러 로그 출력 여부 (기본: false)
    headers?: Record<string, string>; // 커스텀 헤더
}

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

    // 기본 헤더 구성
    const finalHeaders: Record<string, string> = {
        ...headers,
    };

    // FormData가 아닐 때만 Content-Type 지정
    if (!(restOptions.body instanceof FormData)) {
        finalHeaders["Content-Type"] = "application/json";
    }

    // 토큰 있을 경우 Authorization 설정
    if (token) {
        finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        headers: finalHeaders,
        ...restOptions,
    });

    if (!response.ok) {
        let message = `API Error: ${response.status}`;

        try {
            const data = await response.json();
            message = data?.message || JSON.stringify(data);
        } catch (error: unknown) {
            // JSON 파싱 실패했을 때 fallback 메시지 설정
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
