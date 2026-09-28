import { getActiveWebPushes, notificationWebPushSubscribe, toggleNotificationSetting, unsubscribeWebPush } from "@/app/utile/api/NotificationApi";
import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { getBrowserPushSubscription, isWebPushSupported, subscribeBrowserPush, unsubscribeBrowserPush } from "@/app/utile/push/webPush";
import { useEffect, useState } from "react";

interface Props {
    notifications: boolean;
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
    userId: number;
}

export default function Settings({ notifications, repeatType, userId }: Props) {
    const { isDark, toggleDarkMode } = useDarkModeContext();
    const [notifEnabled, setNotifEnabled] = useState(notifications);
    const [webPushEnabled, setWebPushEnabled] = useState(false);
    const [webPushSupported, setWebPushSupported] = useState(true);
    const [webPushLoading, setWebPushLoading] = useState(false);
    const [webPushError, setWebPushError] = useState<string | null>(null);

    // 웹 푸시는 기기(브라우저)별 구독이므로, 이 브라우저의 구독이 서버에 활성 상태로 있을 때만 켜짐으로 본다
    useEffect(() => {
        const loadWebPushStatus = async () => {
            if (!isWebPushSupported()) {
                setWebPushSupported(false);
                return;
            }
            if (!userId) return; // 회원 번호를 불러오기 전(0)에는 조회하지 않는다
            try {
                const subscription = await getBrowserPushSubscription();
                if (!subscription) {
                    setWebPushEnabled(false);
                    return;
                }
                const pushes = await getActiveWebPushes(userId);
                setWebPushEnabled(pushes.some((push) => push.endpoint === subscription.endpoint));
            } catch (err) {
                console.error("웹 푸시 상태 조회 실패", err);
            }
        };

        loadWebPushStatus();
    }, [userId]);

    // 알림 구독 여부 
    const handleToggleNotification = async () => {
        try {
            const updated = await toggleNotificationSetting(userId, !notifEnabled);
            console.log(updated);
            setNotifEnabled(updated.webEnabled); // 서버 응답 기반으로 업데이트
        } catch (err) {
            console.error("알림 토글 실패", err);
        }
    };

    // 웹 푸시 알림 구독 여부
    const handleToggleWebPush = async () => {
        setWebPushLoading(true);
        setWebPushError(null);
        try {
            if (!webPushEnabled) {
                // 🔔 이 브라우저 구독 생성(권한 요청 포함) → 서버에 등록
                const subscription = await subscribeBrowserPush();
                await notificationWebPushSubscribe(subscription);
                setWebPushEnabled(true);
            } else {
                // 🔕 이 브라우저만 해제. 서버를 먼저 끊어야 브라우저 해제가 실패해도 서버가 계속 보내지 않는다
                const subscription = await getBrowserPushSubscription();
                if (subscription) {
                    await unsubscribeWebPush(userId, subscription.endpoint);
                    await unsubscribeBrowserPush();
                }
                setWebPushEnabled(false);
            }
        } catch (err) {
            console.error("웹 푸시 토글 실패", err);
            setWebPushError(err instanceof Error ? err.message : "웹 푸시 설정에 실패했습니다.");
        } finally {
            setWebPushLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">⚙️ 환경 설정</h2>

            <p className="text-sm">
                알림 수신 여부: {notifEnabled ? '✅ 켜짐' : '❌ 꺼짐'}<br />
                웹 푸시: {webPushEnabled ? '🔔 활성화' : '🔕 비활성화'}<br />
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

            <button
                onClick={handleToggleWebPush}
                disabled={!webPushSupported || webPushLoading || !userId}
                className={`ml-2 px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${webPushEnabled
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-400 text-white hover:bg-gray-500"}`}
            >
                {webPushLoading ? "처리 중..." : `웹 푸시 ${webPushEnabled ? "끄기" : "켜기"}`}
            </button>

            {!webPushSupported && (
                <p className="mt-2 text-xs text-gray-500">이 브라우저는 웹 푸시를 지원하지 않습니다.</p>
            )}
            {webPushError && (
                <p className="mt-2 text-xs text-red-500">{webPushError}</p>
            )}
        </div>
    );
}