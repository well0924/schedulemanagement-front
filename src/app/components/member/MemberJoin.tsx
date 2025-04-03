'use client'

import { useDarkModeContext } from "@/app/context/DarkModeContext";
import { useState } from "react";

export default function SignUpForm() {
    const { isDark } = useDarkModeContext();

    const [form, setForm] = useState({
        userId: '',
        password: '',
        userEmail: '',
        userName: '',
        userPhone: ''
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null); // 입력 시 에러 초기화
    };

    const validate = () => {
        if (Object.values(form).some(value => !value.trim())) {
            return "모든 항목을 입력해주세요.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.userEmail)) {
            return "올바른 이메일 형식을 입력해주세요.";
        }

        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(form.userPhone)) {
            return "전화번호는 010-XXXX-XXXX 형식이어야 합니다.";
        }

        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationMessage = validate();

        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        console.log(form);
        // 👉 TODO: 회원가입 요청 보내기
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center transition-colors ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
                }`}
        >
            <form
                onSubmit={handleSubmit}
                className={`${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
            >
                <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>✍️ 회원가입</h2>

                <div className={`space-y-4 ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                    {[
                        { label: '아이디', name: 'userId', type: 'text' },
                        { label: '비밀번호', name: 'password', type: 'password' },
                        { label: '이메일', name: 'userEmail', type: 'email' },
                        { label: '이름', name: 'userName', type: 'text' },
                        { label: '전화번호', name: 'userPhone', type: 'text' },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className={`block text-sm text-gray-700 ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={form[field.name as keyof typeof form]}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                                placeholder={`${field.label}을(를) 입력하세요`}
                            />
                        </div>
                    ))}
                </div>

                {error && (
                    <p className="text-sm text-red-500 mt-4">{error}</p>
                )}

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
                >
                    회원가입
                </button>
            </form>
        </div>
    );
}