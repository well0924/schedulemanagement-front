import { LoginRequest, LoginResponse } from "@/app/interfaces/Login/LoginModel";
import { fetcher } from "../fetcher";


//로그인 
export async function fetchLogin(data: LoginRequest): Promise<LoginResponse> {
    return fetcher<LoginResponse>("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

//로그아웃
export async function fetchLogout(): Promise<void> {
    await fetcher("/log-out", {
        method: "POST",
    });
}

//토큰 재발급
export async function fetchTokenReissue(refreshTokenDto: { refreshToken: string }): Promise<LoginResponse> {
    return fetcher<LoginResponse>("/reissue", {
        method: "POST",
        body: JSON.stringify(refreshTokenDto),
    });
}