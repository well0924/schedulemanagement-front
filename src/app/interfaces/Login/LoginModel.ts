
//로그인 요청 
export interface LoginRequest {
    userId: string;
    password: string;
}
//로그인 응답
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    grantType: string;
    refreshTokenExpiredTime: number;
}