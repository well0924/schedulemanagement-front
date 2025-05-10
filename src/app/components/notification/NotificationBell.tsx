'use client';

import { Notification } from '@/app/interfaces/notification/NotificationModel';
import { getNotifications, getUnreadNotifications } from '@/app/utile/api/NotificationApi';
import { useAuth } from '@/app/utile/context/AuthContext';
import { connectNotificationWS } from '@/app/utile/websocket/websokcet';
import { useState, useRef, useEffect } from 'react';

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

    // 알림 불러오기
    useEffect(() => {
        if (userId === null) return;

        const fetchNotifications = async () => {
            try {
                const allNotifications = await getNotifications(userId);
                const unreadNotifications = await getUnreadNotifications(userId);
                setNotifications(allNotifications);
                setUnreadCount(unreadNotifications.length);
            } catch (error) {
                console.error("알림을 불러오는 중 오류 발생:", error);
            }
        };

        fetchNotifications();
    }, [userId]);

    // WebSocket 연결 추가
    useEffect(() => {
        if (!userId || !accessToken) return;

        const client = connectNotificationWS(userId, accessToken, (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            client?.disconnect();
        };
    }, [userId, accessToken]);


    const handleRead = async (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        // TODO: 서버 반영 필요
        
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
                                .map((n) => (
                                    <li
                                        key={n.id}
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
