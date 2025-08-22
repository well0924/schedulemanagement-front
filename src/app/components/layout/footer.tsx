'use client';

import { useEffect, useState } from "react";

export default function Footer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const hasDark = document.documentElement.classList.contains("dark");
      setIsDark(hasDark);
    };

    checkDark(); // 초기 다크모드 상태 확인

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
    <footer className={`
      flex flex-col items-center justify-center
      text-sm text-center py-4 px-4 sm:px-6
      transition-colors duration-300
      ${isDark ? "bg-gray-900 text-gray-400" : "bg-gray-100 text-gray-700"}
    `}>
      © 2025 Schedule.AI. All rights reserved.
    </footer>
  );
}
