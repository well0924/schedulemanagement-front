import { toggleNotificationSetting } from "@/app/utile/api/NotificationApi";
import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { useState } from "react";

interface Props {
    notifications: boolean;
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
    userId: number;
}

export default function Settings({ notifications, repeatType, userId }: Props) {
    const { isDark, toggleDarkMode } = useDarkModeContext();
    const [notifEnabled, setNotifEnabled] = useState(notifications);
    
    const handleToggleNotification = async () => {
        try {
            const updated = await toggleNotificationSetting(userId, !notifEnabled);
            console.log(updated);
            setNotifEnabled(updated.webEnabled); // 서버 응답 기반으로 업데이트
        } catch (err) {
            console.error("알림 토글 실패", err);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">⚙️ 환경 설정</h2>

            <p className="text-sm">
                알림 수신 여부: {notifEnabled  ? '✅ 켜짐' : '❌ 꺼짐'}<br />
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

            <button
                onClick={handleToggleNotification}
                className={`ml-2 px-3 py-1 text-sm rounded transition-colors
                          ${notifEnabled ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"}`}
            >
                알림 {notifEnabled ? '끄기' : '켜기'}
            </button>
        </div>
    );
}