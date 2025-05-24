'use client';

import { useEffect, useState } from "react";
import ActionButtons from './ActionButtons';
import ScheduleSummary from './ScheduleSummary';
import Settings from './Settings';
import { fetchUserIdFromServer } from "@/app/utile/api/LoginApi";
import { TodayScheduleList } from "@/app/utile/api/ScheduleApi";

export default function MyPageSection() {
  const [isDark, setIsDark] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const checkDark = () => {
      const hasDark = document.documentElement.classList.contains("dark");
      setIsDark(hasDark);
    };

    checkDark();

    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadTodaySchedules = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const userId = await fetchUserIdFromServer(token);
        const schedules = await TodayScheduleList(userId);

        setTotal(schedules.length);
        setCompleted(schedules.filter(s => s.progressStatus?.value === "COMPLETE").length);
      } catch (err) {
        console.error("오늘의 일정 로드 실패", err);
        setTotal(0);
        setCompleted(0);
      }
    };

    loadTodaySchedules();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className={`
        p-6 rounded shadow transition-colors duration-300
        ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
      `}>
        <h1 className="text-2xl font-bold mb-6">🗓️ 마이페이지</h1>

        <section className="mb-6">
          <ScheduleSummary total={total} completed={completed} />
        </section>

        <section className="mb-6">
          <Settings notifications={true} repeatType="DAILY" />
        </section>

        <ActionButtons />
      </div>
    </div>
  );
}
