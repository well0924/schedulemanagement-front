'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackClient() {
    const router = useRouter();
  
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
  
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        router.push("/");
      } else {
        alert("소셜 로그인 실패: 토큰 누락");
        router.push("/login");
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        로그인 처리 중입니다...
      </div>
    );
  }