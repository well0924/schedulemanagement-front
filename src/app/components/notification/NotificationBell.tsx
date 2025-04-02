'use client';

import { useState, useRef, useEffect } from 'react';

type NoticeType = 'SCHEDULE_CREATED' |
    'SCHEDULE_REMINDER' |
    'SCHEDULE_UPDATED' |
    'SCHEDULE_DELETED' |
    'SCHEDULE_OVERDUE' |
    'SCHEDULE_COMPLETED' |
    'SCHEDULE_REPEATED' |
    'SYSTEM_ANNOUNCEMENT' |
    'CUSTOM_NOTIFICATION' |
    'TAG_MENTION';

interface Notification {
    id: number;
    message: string;
    noticeType: NoticeType;
    isRead: boolean;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, message: "새로운 일정이 등록되었습니다.", noticeType: 'SCHEDULE_COMPLETED', isRead: false },
        { id: 2, message: "오늘 14:00 회의가 곧 시작됩니다.", noticeType: 'SCHEDULE_REMINDER', isRead: false },
        { id: 3, message: "서버 점검 예정입니다.", noticeType: 'SYSTEM_ANNOUNCEMENT' , isRead: false },
    ]);

    const bellRef = useRef<HTMLDivElement>(null);

    // 바깥 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const renderIcon = (type: NoticeType) => {
        switch (type) {
            case 'SCHEDULE_COMPLETED': return '📅';
            case 'SCHEDULE_REMINDER': return '⚠️';
            case 'SCHEDULE_OVERDUE': return '🚨';
            case 'SYSTEM_ANNOUNCEMENT': return '💻';
            case 'CUSTOM_NOTIFICATION': return 'ℹ️';
            default: return '🔔';
        }
    };

    const renderColor = (type: NoticeType) => {
        switch (type) {
            case 'SCHEDULE_REMINDER': return 'text-red-500';
            case 'SCHEDULE_OVERDUE': return 'text-orange-500';
            case 'SCHEDULE_COMPLETED': return 'text-blue-600';
            case 'SYSTEM_ANNOUNCEMENT': return 'text-gray-500';
            case 'CUSTOM_NOTIFICATION': return 'text-sky-500';
            default: return 'text-black';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div ref={bellRef} className="relative">
            {/* 알림 버튼 */}
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

            {/* 드롭다운 알림 목록 */}
            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-md border rounded z-50">
                    <div className="p-3 text-sm font-semibold border-b">📢 알림 목록</div>

                    <ul className="max-h-60 overflow-y-auto text-sm divide-y">
                        {unreadCount === 0 && (
                            <li className="p-4 text-center text-gray-400">알림이 없습니다.</li>
                        )}

                        {notifications
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
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}