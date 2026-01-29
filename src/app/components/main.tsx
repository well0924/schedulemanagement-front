'use client';

import { ScheduleRequest, ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import { useEffect, useState } from "react";
import TodaySchedule from "./calendar/TodaySchedules";
import AddScheduleButton from "./calendar/AddScheduleButton";
import ScheduleCalendar from "./calendar/MainCalendar";
import { fetchUserIdFromServer } from "../utile/api/LoginApi";
import { bulkDeleteSchedules, createSchedule, TodayScheduleList } from "../utile/api/ScheduleApi";
import { connectNotificationWS } from "../utile/websocket/websokcet";
import TodaySummary from "./calendar/TodaySummary";

export default function ClientHome() {
    const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
    const [, setUserId] = useState<number | null>(null);
    const [calendarReloadFlag, setCalendarReloadFlag] = useState(false);

    const total = schedules.length;
    const completed = schedules.filter(s => s.progressStatus?.value === 'COMPLETE').length;


    // websocket 연결
    useEffect(() => {
        const timer = setTimeout(() => {
            const token = localStorage.getItem("accessToken");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                console.log("⏳ 토큰 없음 → WebSocket 연결 안함");
                return;
            }

            const client = connectNotificationWS(parseInt(userId), token, (data) => {
                console.log("📨 알림 수신:", data);
            });

            // cleanup
            return () => {
                if (client) {
                    client.disconnect(() => {
                        console.log("🛑 WebSocket 연결 종료");
                    });
                }
            };
        }, 300); // 300~500ms

        return () => clearTimeout(timer);
    }, []);

    //Today 일정 + 유저 정보 불러오기 
    useEffect(() => {
        const loadUserIdAndSchedules = async () => {
            const token = localStorage.getItem("accessToken");

            let id: number | null = null;

            if (token) {
                try {
                    id = await fetchUserIdFromServer(token);
                    setUserId(id);
                } catch {
                    console.warn("로그인 상태 아님 or 사용자 정보 조회 실패");
                }
            }

            try {
                if (id !== null) {
                    const todaySchedules = await TodayScheduleList();
                    console.log(todaySchedules);
                    setSchedules(todaySchedules);
                } else {
                    // 여기서 비로그인 사용자 처리
                    setSchedules([]); // 또는 fetchPublicSchedules() 호출
                }
            } catch (e) {
                console.error("일정 조회 실패:", e);
            }
        };

        loadUserIdAndSchedules();
    }, []);

    const handleDelete = async (ids: number[]) => {
        await bulkDeleteSchedules(ids);
        setSchedules(prev => prev.filter(s => !ids.includes(s.id)));
    };

    const handleEdit = (schedule: ScheduleResponse) => {
        // TODO: 일정 수정 모달 띄우기 등 추가 예정
        console.log("수정할 일정:", schedule);
    };

    const handleAddSchedule = async (newScheduleRequest: ScheduleRequest) => {
        try {
            const saved = await createSchedule(newScheduleRequest);

            // 오늘 날짜인지 확인
            const isToday = (dateStr: string) => {
                const today = new Date();
                const target = new Date(dateStr);
                return (
                    today.getFullYear() === target.getFullYear() &&
                    today.getMonth() === target.getMonth() &&
                    today.getDate() === target.getDate()
                );
            };

            // 만약 생성된 일정이 오늘 포함이면 today 리스트에도 추가
            if (isToday(saved.startTime) || isToday(saved.endTime)) {
                setSchedules(prev => [...prev, saved]); // TodaySchedule에 반영
            }

            setCalendarReloadFlag(prev => !prev);
        } catch (err) {
            console.error("일정 생성 실패", err);
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* 상단 페이지 타이틀 */}
            <h1 className="text-2xl font-bold mb-4 mt-4">내 일정</h1>

            {/* 메인 레이아웃 */}
            <div className="flex gap-6 items-start">

                {/* 왼쪽: TodaySchedule + Today Summary */}
                <aside className="w-[420px] flex-shrink-0 mb-8">
                    <TodaySummary total={total} completed={completed} />

                    <TodaySchedule
                        schedules={schedules}
                        onDeleteSchedules={handleDelete}
                    />
                </aside>

                {/* 오른쪽: 캘린더 */}
                <main className="flex-1">
                    <div className="rounded-xl shadow-lg p-8 bg-gray-800 border border-gray-700">
                        <ScheduleCalendar reloadTrigger={calendarReloadFlag} />
                    </div>
                </main>
            </div>

            {/* 플로팅 추가 버튼 */}
            <AddScheduleButton onScheduleAdd={handleAddSchedule} />
        </div>
    );
}
