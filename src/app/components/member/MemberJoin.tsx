'use client'

import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { MemberJoin } from "@/app/utile/api/MemberApi";
import { useState, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";

// 필드/폼 타입
type FieldName = "userId" | "password" | "userEmail" | "userName" | "userPhone";
type Field = {
    label: string;
    name: FieldName;
    type: "text" | "password" | "email" | "tel";
    colSpan?: 1 | 2;
    extraProps?: InputHTMLAttributes<HTMLInputElement>;
};

// 전화번호 자동 하이픈
const formatPhone = (v: string) =>
    v
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/^(\d{0,3})(\d{0,4})(\d{0,4}).*$/, (_, a, b, c) =>
            [a, b, c].filter(Boolean).join("-")
        );

export default function SignUpForm() {
    const { isDark } = useDarkModeContext();
    const router = useRouter();

    const [form, setForm] = useState<Record<FieldName, string>>({
        userId: "",
        password: "",
        userEmail: "",
        userName: "",
        userPhone: "",
    });

    const FIELDS: Field[] = [
        { label: "아이디", name: "userId", type: "text" },
        { label: "비밀번호", name: "password", type: "password" },
        { label: "이메일", name: "userEmail", type: "email", colSpan: 2 },
        { label: "이름", name: "userName", type: "text" },
        {
            label: "전화번호",
            name: "userPhone",
            type: "tel",
            extraProps: {
                inputMode: "numeric",
                pattern: "^010-\\d{4}-\\d{4}$",
                placeholder: "010-1234-5678",
            },
        },
    ];

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name as FieldName]: name === "userPhone" ? formatPhone(value) : value,
        }));
        setError(null);
    };

    const validate = () => {
        if (Object.values(form).some((v) => !v.trim())) return "모든 항목을 입력해주세요.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.userEmail)) return "올바른 이메일 형식을 입력해주세요.";

        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(form.userPhone)) return "전화번호는 010-XXXX-XXXX 형식이어야 합니다.";

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const msg = validate();
        if (msg) return setError(msg);

        try {
            await MemberJoin(form);
            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            router.push("/member");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err?.message || "회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div
            className={[
                "min-h-screen flex items-center justify-center",
                "px-4 sm:px-6 lg:px-8",
                "transition-colors",
                isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
            ].join(" ")}
        >
            <form
                onSubmit={handleSubmit}
                noValidate
                className={[
                    "w-full",
                    "max-w-sm sm:max-w-md md:max-w-2xl",
                    "bg-white dark:bg-gray-800",
                    "rounded-xl shadow-md",
                    "p-6 sm:p-8 md:p-10",
                    "ring-1 ring-black/5 dark:ring-white/10",
                ].join(" ")}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">✍️ 회원가입</h2>

                <div className="flex flex-col gap-y-5">
                    {FIELDS.map((field) => (
                        <div
                            key={field.name}
                            className={field.colSpan === 2 ? "md:col-span-2" : undefined}
                        >
                            <div className="flex min-h-[96px] sm:min-h-[104px] flex-col justify-start">
                                <label
                                    htmlFor={field.name}
                                    className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1.5"
                                >
                                    {field.label}
                                </label>

                                <input
                                    id={field.name}
                                    type={field.type}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    autoComplete={
                                        field.name === "userId" ? "username" :
                                            field.name === "password" ? "new-password" :
                                                field.name === "userEmail" ? "email" :
                                                    field.name === "userPhone" ? "tel-national" : "name"
                                    }
                                    className="w-full h-11 sm:h-12 rounded-lg border border-gray-300 dark:border-gray-600 px-3 text-sm sm:text-base dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                                    placeholder={`${field.label}을(를) 입력하세요`}
                                    {...(field.extraProps ?? {})}
                                    required
                                />

                                <div className="mt-1 h-5 sm:h-6">
                                    {field.name === "userPhone" ? (
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            형식: 010-1234-5678
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <p className="mt-4 text-sm sm:text-base text-red-500" role="alert" aria-live="polite">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className={[
                        "mt-6 w-full rounded-lg",
                        "py-2.5 sm:py-3",
                        "text-sm sm:text-base font-semibold",
                        "bg-blue-600 hover:bg-blue-700",
                        "text-white transition-colors",
                    ].join(" ")}
                >
                    회원가입
                </button>

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    이미 계정이 있나요?{" "}
                    <a href="/member" className="font-medium hover:underline">
                        로그인
                    </a>
                </div>
            </form>
        </div>
    );
}
