'use client'

import { useAuth } from "@/app/utile/context/AuthContext";

export default function ActionButtons() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 후 리디렉션 필요 시 아래 라우팅 사용 (예: 로그인 페이지)
      window.location.href = "/login";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="flex gap-3 justify-end mt-6">
      <button className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300">
        비밀번호 변경
      </button>
      <button 
       onClick={handleLogout}
       className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600">
        로그아웃
      </button>
    </div>
  );
}
