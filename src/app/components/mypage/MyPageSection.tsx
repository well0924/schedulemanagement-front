'use client';

import { useEffect, useState } from "react";
import ActionButtons from './ActionButtons';
import ScheduleSummary from './ScheduleSummary';
import Settings from './Settings';

export default function MyPageSection() {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className={`
        p-6 rounded shadow transition-colors duration-300
        ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
      `}>
        <h1 className="text-2xl font-bold mb-6">🗓️ 마이페이지</h1>

        <section className="mb-6">
          <ScheduleSummary total={12} completed={9} />
        </section>

        <section className="mb-6">
          <Settings notifications={true} repeatType="DAILY" />
        </section>

        <ActionButtons />
      </div>
    </div>
  );
}
