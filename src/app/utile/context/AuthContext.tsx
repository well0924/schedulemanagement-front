'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { fetchTokenReissue } from "../api/LoginApi";

interface AuthContextType {
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  checkAndReissueToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  login: () => { },
  logout: () => { },
  isLoggedIn: false,
  checkAndReissueToken: async () => null,
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

  const logout = () => {
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

  const isLoggedIn = !!accessToken;

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isLoggedIn, checkAndReissueToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
