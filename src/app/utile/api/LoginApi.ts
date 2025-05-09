import { LoginRequest, LoginResponse } from "@/app/interfaces/Login/LoginModel";
import { fetcher } from "./fetcher";


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
    console.log(token);
    await fetch("http://localhost:8082/api/auth/log-out", {
        method: "POST",
        headers: {
            Authorization: token, // Bearer 없이 보낸다고 했지?
        },
    });
}

//토큰 재발급
export async function fetchTokenReissue(refreshTokenDto: { refreshToken: string }): Promise<LoginResponse> {
    return fetcher<LoginResponse>("/api/auth/reissue", {
        method: "POST",
        body: JSON.stringify(refreshTokenDto),
    });
}

export async function fetchUserIdFromServer(accessToken: string): Promise<number> {
    const response = await fetch("http://localhost:8082/api/auth/user-id", {
        method: "GET",
        headers: {
            Authorization: accessToken, // Bearer 없이 보낸다고 했지?
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} - ${text}`);
    }

    return response.json(); // 서버에서 Long 반환하면 number로 변환됨
}