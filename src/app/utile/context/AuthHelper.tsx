import { fetchTokenReissue } from "../api/LoginApi";

export async function checkAndReissueToken(): Promise<string | null> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  if (!refreshToken) {
    console.error("refreshToken 없음");
    return null;
  }

  try {
    const response = await fetchTokenReissue({ refreshToken });
    localStorage.setItem("accessToken", response.accessToken);
    return response.accessToken;
  } catch (error) {
    console.error("토큰 재발급 실패", error);
    return null;
  }
}
