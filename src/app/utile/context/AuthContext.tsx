'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { fetchLogout, fetchTokenReissue, fetchUserIdFromServer } from "../api/LoginApi";

interface AuthContextType {
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  checkAndReissueToken: () => Promise<string | null>;
  fetchUserId: () => Promise<number | null>;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  login: () => { },
  logout: () => { },
  isLoggedIn: false,
  checkAndReissueToken: async () => null,
  fetchUserId: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setAccessToken(token);
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAccessToken(accessToken);
  };

  const logout = async () => {

    try {
      await fetchLogout(); // 서버에 로그아웃 요청
    } catch (err) {
      console.warn("서버 로그아웃 실패 (무시하고 클라이언트 로그아웃만 진행)", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
  };

  const checkAndReissueToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetchTokenReissue({ refreshToken });
      localStorage.setItem("accessToken", response.accessToken);
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch (err) {
      console.error("토큰 재발급 실패:", err);
      logout(); // 재발급 실패 시 강제 로그아웃
      return null;
    }
  };

  // userId를 서버에서 가져오는 함수
  const fetchUserId = async (): Promise<number | null> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }

    try {
      const userId = await fetchUserIdFromServer(token); // 서버에서 userId 가져오기
      return userId;
    } catch (error) {
      console.error("userId를 가져오는 중 오류 발생:", error);
      return null;
    }
  };

  const isLoggedIn = !!accessToken;

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isLoggedIn, checkAndReissueToken ,fetchUserId}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
