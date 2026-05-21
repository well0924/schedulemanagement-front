'use client';

import { Loader2, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/utile/context/AuthContext';
import { connectChatWS } from '@/app/utile/websocket/chatWebSocket'; // 새로 만든 파일
import { fetcher } from '@/app/utile/api/fetcher';
import { CompatClient } from '@stomp/stompjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatTokenResponse {
  content: string;
}

export default function ScheduleChatBot() {
  const { accessToken } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 오늘 일정을 분석해 드릴까요?' }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const stompClientRef = useRef<CompatClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 고정
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 웹소켓 연결
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!accessToken || !userId) return;

    stompClientRef.current = connectChatWS(
      userId,
      accessToken,
      (data: unknown) => {
        const response = data as ChatTokenResponse;
        const tokenChunk = response.content;

        if (tokenChunk === "[DONE]" || !tokenChunk) {
          setIsStreaming(false);
          return;
        }
        setIsStreaming(true);
        // Kafka를 통해 들어오는 한 글자(토큰)씩 누적 처리
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + tokenChunk }
            ];
          } else {
            return [...prev, { role: 'assistant', content: tokenChunk }];
          }
        });
      }
    );

    return () => {
      if (stompClientRef.current) stompClientRef.current.disconnect();
    };
  }, [accessToken]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !stompClientRef.current) return;

    const userMsg = input.trim();
    const userId = localStorage.getItem("userId");

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsStreaming(true);

    // 백엔드 Kafka Producer 호출 엔드포인트로 메시지 전송
    try {
      // 에러 포인트 3: 백엔드 Long 타입에 맞게 Number로 변환하여 전송
      await fetcher('/api/v1/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          memberId: Number(userId), // 여기서 Long 타입 규격에 맞춤
          message: userMsg
        })
      });
    } catch (error) {
      console.error("전송 실패:", error);
      setIsStreaming(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: '메시지 전송에 실패했습니다.' }]);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h3 className="font-semibold text-white text-sm">AI 일정 비서 (Beta)</h3>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isStreaming ? "AI가 답변 중..." : "일정에 대해 물어보세요..."}
            disabled={isStreaming}
            className="flex-1 bg-gray-900 text-white text-sm rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}