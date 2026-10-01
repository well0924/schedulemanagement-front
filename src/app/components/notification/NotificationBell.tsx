'use client';

import { Notification } from '@/app/utile/interfaces/notification/NotificationModel';
import { getNotifications, getUnreadNotifications, isMarkedRead } from '@/app/utile/api/NotificationApi';
import { useAuth } from '@/app/utile/context/AuthContext';
import { connectNotificationWS } from '@/app/utile/websocket/websokcet';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const { accessToken, fetchUserId } = useAuth();
    const bellRef = useRef<HTMLDivElement>(null);

    const [userId, setUserId] = useState<number | null>(null);

    // 사용자 ID를 받아오는 로직
    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await fetchUserId(); // 서버에서 userId 가져오기
                if (id !== null) {
                    setUserId(id);
                }
            } catch (e) {
                console.error("userId 가져오기 실패:", e);
            }
        };

        if (accessToken) {
            getUserId();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    // 알림 불러오기 (DB에 저장된 알림 = 읽음 처리에 쓸 실제 번호를 가진 알림)
    const fetchNotifications = useCallback(async () => {
        if (userId === null) return;
        try {
            const allNotifications = await getNotifications(userId);
            const unreadNotifications = await getUnreadNotifications(userId);
            setNotifications(allNotifications);
            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error("알림을 불러오는 중 오류 발생:", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // WebSocket 연결 추가
    // 실시간 메시지는 Kafka 이벤트 원본이라 DB 알림 번호(id)가 없다.
    // 예전처럼 Date.now()를 번호로 넣으면 읽음 처리(PATCH /api/notice/{id}/read)가 404가 나므로,
    // 메시지는 "새 알림이 있다"는 신호로만 쓰고 목록은 서버에서 다시 불러온다.
    useEffect(() => {
        if (!userId || !accessToken) return;

        let refetchTimer: ReturnType<typeof setTimeout> | null = null;
        const client = connectNotificationWS(userId, accessToken, () => {
            // 알림이 연달아 오면 한 번만 불러온다
            if (refetchTimer) clearTimeout(refetchTimer);
            refetchTimer = setTimeout(fetchNotifications, 300);
        });

        return () => {
            if (refetchTimer) clearTimeout(refetchTimer);
            if (client?.connected) client.disconnect();
        };
    }, [userId, accessToken, fetchNotifications]);


    const handleRead = async (id: number) => {
        try {
            // 1. 클라이언트 상태 업데이트
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            // 2. 서버 상태 반영
            await isMarkedRead(id); // 여기를 실제 API로 요청

        } catch (e) {
            console.error('알림 읽음 처리 실패:', e);
        }
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'SCHEDULE_CREATED': return '🗓️';
            case 'SCHEDULE_UPDATED': return '📝';
            case 'SCHEDULE_DELETED': return '❌';
            case 'SCHEDULE_COMPLETED': return '✅';
            case 'SCHEDULE_REPEATED': return '🔄';
            default: return '🔔';
        }
    };

    const renderColor = (type: string) => {
        switch (type) {
            case 'SCHEDULE_REMINDER': return 'text-red-500';
            case 'SCHEDULE_COMPLETED': return 'text-blue-600';
            case 'SCHEDULE_UPDATED': return 'text-yellow-500';
            case 'SCHEDULE_DELETED': return 'text-gray-500';
            case 'SCHEDULE_REPEATED': return 'text-green-500';
            default: return 'text-black';
        }
    };

    return (
        <div ref={bellRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="text-gray-700 hover:text-blue-600 relative"
                title="알림"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-md border rounded z-50">
                    <div className="p-3 text-sm font-semibold border-b">📢 알림 목록</div>
                    <ul className="max-h-60 overflow-y-auto text-sm divide-y">
                        {unreadCount === 0 ? (
                            <li className="p-4 text-center text-gray-400">알림이 없습니다.</li>
                        ) : (
                            notifications
                                .filter((n) => !n.isRead)
                                .map((n, idx) => (
                                    <li
                                        key={n.id ?? `${n.scheduleId}-${idx}`}
                                        className="px-4 py-2 flex gap-2 items-start cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleRead(n.id)}
                                    >
                                        <span>{renderIcon(n.noticeType)}</span>
                                        <span className={`${renderColor(n.noticeType)} text-sm`}>
                                            {n.message}
                                        </span>
                                    </li>
                                ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
