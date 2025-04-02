import { useDarkModeContext } from "@/app/context/DarkModeContext";

interface Props {
    notifications: boolean;
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
}

export default function Settings({ notifications, repeatType }: Props) {
    const { isDark, toggleDarkMode } = useDarkModeContext();

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">⚙️ 환경 설정</h2>

            <p className="text-sm">
                알림 수신 여부: {notifications ? '✅ 켜짐' : '❌ 꺼짐'}<br />
                반복 일정 기본값: {repeatType} <br />
                다크모드: {isDark ? '🌙 활성화됨' : '☀️ 비활성화됨'}
            </p>

            <button
                onClick={toggleDarkMode}
                className="mt-2 px-3 py-1 text-sm rounded transition-colors
          bg-gray-200 text-black hover:bg-gray-300 
          dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
                다크모드 {isDark ? '끄기' : '켜기'}
            </button>
        </div>
    );
}