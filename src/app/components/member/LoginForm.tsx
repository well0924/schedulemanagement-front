'use client'

import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { fetchLogin } from "@/app/utile/api/LoginApi";
import { useState } from "react";
import { API_BASE } from "@/app/utile/api/apiBase";


export default function LoginForm() {
    const { isDark } = useDarkModeContext();
    const [form, setForm] = useState({ userId: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(""); // 입력 시 에러 초기화
    };

    const handleSocialLogin = (provider: string) => {
        // 소셜 로그인 경로는 nginx가 백엔드로 넘기도록 /api 아래에 있다
        window.location.href = `${API_BASE}/api/oauth2/authorization/${provider}`;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.userId.trim() || !form.password.trim()) {
            setError("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }
        console.log({ form });

        try {
            const response = await fetchLogin({
                userId: form.userId,
                password: form.password,
            });

            // 토큰 저장
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);

            // 메인 페이지로 이동
            alert('로그인이 되었습니다.');
            location.href = '/';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "로그인에 실패했습니다.");
        }
    };

    return (
        <div className={[
            "min-h-screen flex items-center justify-center",
            "px-4 sm:px-6 lg:px-8", // 반응형 좌우 여백
            "transition-colors",
            isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
        ].join(" ")}>
            <form onSubmit={handleSubmit} className={
                [
                    "w-full",
                    // 모바일 기본 폭 → 태블릿에서 커지고, 데스크탑에서 더 넓어짐
                    "max-w-sm sm:max-w-md md:max-w-lg",
                    // 카드 스타일 + 반응형 패딩
                    "bg-white dark:bg-gray-800",
                    "rounded-xl shadow-md",
                    "p-6 sm:p-8 md:p-10",
                    // 큰 화면에서 살짝 떠보이게
                    "ring-1 ring-black/5 dark:ring-white/10",
                ].join(" ")
            }>
                <h2 className="text-center font-bold text-2xl sm:text-3xl mb-6 sm:mb-8">🔐 로그인</h2>

                <div className="space-y-5 sm:space-y-6">
                    <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1.5">아이디</label>
                    <input
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        className={[
                            "w-full rounded-lg",
                            "border border-gray-300 dark:border-gray-600",
                            "px-3 py-2.5 sm:py-3",
                            "text-sm sm:text-base",
                            "dark:bg-gray-700 dark:text-white",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/60",
                        ].join(" ")}
                        placeholder="아이디를 입력하세요"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={[
                            "w-full rounded-lg",
                            "border border-gray-300 dark:border-gray-600",
                            "px-3 py-2.5 sm:py-3",
                            "text-sm sm:text-base",
                            "dark:bg-gray-700 dark:text-white",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/60",
                        ].join(" ")}
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500" role="alert"
                        aria-live="polite">{error}</p>
                )}

                <button
                    type="submit"
                    className={[
                        "w-full rounded-lg",
                        "py-2.5 sm:py-3",
                        "text-sm sm:text-base font-semibold",
                        "bg-blue-600 hover:bg-blue-700",
                        "text-white transition-colors",
                    ].join(" ")}>
                    로그인
                </button>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className={[
                        "rounded-lg w-full",
                        "py-2.5 sm:py-3",
                        "text-sm sm:text-base font-medium",
                        "bg-red-500 hover:bg-red-600",
                        "text-white transition-colors",
                    ].join(" ")}
                >
                    Google로 로그인
                </button>
            </form>
        </div>
    );
}