'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react'; // 아이콘 추가
import ScheduleChatBot from './ScheduleChatBot';

export default function ChatBotFloating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-8 bottom-24 z-50 flex flex-col items-end">
      {/* 챗봇 창: isOpen 상태일 때만 표시 */}
      {isOpen && (
        <div className="mb-4 w-[380px] sm:w-[400px] shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="relative overflow-hidden rounded-xl">
            {/* 우측 상단 닫기 버튼 (선택 사항) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-10 text-gray-400 hover:text-white z-10 p-1"
            >
              <X size={20} />
            </button>
            <ScheduleChatBot />
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-gray-700 rotate-90' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}