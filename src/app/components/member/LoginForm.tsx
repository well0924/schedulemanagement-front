'use client'

import { useDarkModeContext } from "@/app/context/DarkModeContext";
import { useState } from "react";


export default function LoginForm() {
    const { isDark } = useDarkModeContext();
    const [form, setForm] = useState({ userId: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(""); // 입력 시 에러 초기화
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.userId.trim() || !form.password.trim()) {
            setError("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }
        console.log({form});
    };

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors  ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">🔐 로그인</h2>

                <div className="mb-4">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">아이디</label>
                    <input
                        type="text"
                        value={form.userId}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="아이디를 입력하세요"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>
                
                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
                >
                    로그인
                </button>
            </form>
        </div>
    );
}