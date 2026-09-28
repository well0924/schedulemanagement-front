'use client'

import { useEffect } from "react";

// 소셜 로그인 콜백
// 성공: 서버가 토큰을 URL 프래그먼트(#accessToken=...&refreshToken=...)로 전달한다.
//       프래그먼트는 서버 로그·Referer에 남지 않는다.
// 실패: 서버가 ?error=... 로 돌려보낸다.
export default function AuthCallbackClient() {

    useEffect(() => {
      const error = new URLSearchParams(window.location.search).get("error");
      const hash = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hash.get("accessToken");
      const refreshToken = hash.get("refreshToken");

      if (!error && accessToken && refreshToken) {
        // 일반 로그인과 같은 방식으로 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // replace: 토큰이 담긴 URL을 방문 기록에 남기지 않고, 새로고침으로 AuthContext를 다시 읽게 한다
        window.location.replace("/");
      } else {
        alert(error ? `소셜 로그인 실패: ${error}` : "소셜 로그인 실패: 토큰 누락");
        // 로그인 페이지 (/login 경로는 없음)
        window.location.replace("/member");
      }
    }, []);

    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        로그인 처리 중입니다...
      </div>
    );
  }
