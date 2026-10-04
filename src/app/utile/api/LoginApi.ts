import { LoginRequest, LoginResponse } from "@/app/utile/interfaces/login/LoginModel";
import { fetcher } from "./fetcher";
import { API_BASE } from "./apiBase";


//로그인 
export async function fetchLogin(data: LoginRequest): Promise<LoginResponse> {
    return fetcher<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

//로그아웃
export async function fetchLogout(): Promise<void> {
    const token = localStorage.getItem("accessToken") || "";
    // 서버 logout은 "Bearer " 없는 원본 토큰을 받는다 (AuthService.logout)
    await fetch(`${API_BASE}/api/auth/log-out`, {
        method: "POST",
        headers: {
            Authorization: token,
        },
    });
}

//토큰 재발급
// fetcher를 쓰지 않는 이유: fetcher는 만료된 액세스 토큰을 Authorization 헤더에 붙이고,
// 재발급 응답이 401이면 다시 재발급을 호출해 무한 반복된다.
// 서버는 body의 accessToken(만료돼도 됨)으로 사용자를 식별하고, 새 refreshToken으로 교체(rotation)한다.
export async function fetchTokenReissue(dto: { accessToken: string; refreshToken: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/reissue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    if (!response.ok) {
        throw new Error(`토큰 재발급 실패: ${response.status}`);
    }
    return response.json();
}

// 재발급 후 새 토큰 저장 (refreshToken도 교체되므로 같이 저장해야 다음 재발급이 동작한다)
export async function reissueAndStoreTokens(): Promise<string> {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) throw new Error("재발급에 필요한 토큰 없음");

    const res = await fetchTokenReissue({ accessToken, refreshToken });
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    return res.accessToken;
}

export async function fetchUserIdFromServer(accessToken: string): Promise<number> {
    const response = await fetch(`${API_BASE}/api/auth/user-id`, {
        method: "GET",
        headers: {
            Authorization: accessToken, //
        },
    });
    console.log(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} - ${text}`);
    }

    return response.json(); // 서버에서 Long 반환하면 number로 변환됨
}