'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "../notification/NotificationBell";
import { useAuth } from "@/app/utile/context/AuthContext";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    // 마운트 시 다크모드 클래스 유무 확인
    const checkDark = () => {
      const hasDark = document.documentElement.classList.contains("dark");
      setIsDark(hasDark);
    };

    checkDark(); // 초기 한 번 실행

    // 다크모드 클래스 변경 감지
    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className={`h-16 shadow flex justify-between items-center px-6 transition-colors duration-300 ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <Link href={"/"}>
        <h1 className="text-xl font-bold">Schedule.AI</h1>
      </Link>
      <div className="flex gap-2">
        {/*알림*/}
        {isLoggedIn && <NotificationBell />}

        {isLoggedIn ? (
          <>
            {/* 로그인한 경우 */}
            <Link href="/mypage">
              <button className={`px-3 py-1 text-sm rounded transition-colors duration-200
                ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
                마이페이지
              </button>
            </Link>

            <button
              onClick={logout} // 로그아웃 버튼 클릭 시 logout 함수 호출
              className={`px-3 py-1 text-sm rounded transition-colors duration-200
                ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            {/* 로그인 안한 경우 */}
            <Link href="/member/join">
              <button className={`px-3 py-1 text-sm rounded transition-colors duration-200
                ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
                회원가입
              </button>
            </Link>

            <Link href="/member">
              <button className={`px-3 py-1 text-sm rounded transition-colors duration-200
                ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
                로그인
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
