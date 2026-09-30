'use client';

import { Loader2, Send } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/utile/context/AuthContext';
import { ChatConnection, connectChatWS } from '@/app/utile/websocket/chatWebSocket';
import { fetcher } from '@/app/utile/api/fetcher';
import { fetchUserIdFromServer } from '@/app/utile/api/LoginApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 서버 ChatTokenResponse(token, done)와 같은 구조
interface ChatTokenResponse {
  token: string;
  done: boolean;
}

// 이 시간 동안 토큰이 하나도 오지 않으면 입력 잠금을 푼다
const STREAM_IDLE_TIMEOUT_MS = 30_000;

export default function ScheduleChatBot() {
  const { accessToken } = useAuth();
  const [memberId, setMemberId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 오늘 일정을 분석해 드릴까요?' }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const connectionRef = useRef<ChatConnection | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ref와 state setter만 쓰므로 한 번만 만들어 둔다 (웹소켓 콜백에서 안전하게 호출)
  const stopStreaming = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    setIsStreaming(false);
  }, []);

  const armIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: '응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' }]);
      stopStreaming();
    }, STREAM_IDLE_TIMEOUT_MS);
  }, [stopStreaming]);

  // 스크롤 하단 고정
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 회원 번호 조회 (localStorage에는 저장되어 있지 않다)
  useEffect(() => {
    if (!accessToken) return;
    fetchUserIdFromServer(accessToken)
      .then(setMemberId)
      .catch((err) => console.error("회원 번호 조회 실패:", err));
  }, [accessToken]);

  // 웹소켓 연결
  useEffect(() => {
    if (!accessToken || memberId === null) return;

    connectionRef.current = connectChatWS(
      memberId,
      accessToken,
      (data: unknown) => {
        const { token, done } = data as ChatTokenResponse;

        // 토큰이 있으면 먼저 붙이고 (서버의 오류 안내 "오류 발생"도 done=true와 함께 온다)
        if (token) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + token }
              ];
            }
            return [...prev, { role: 'assistant', content: token }];
          });
        }

        if (done) {
          stopStreaming();
        } else {
          armIdleTimer();
        }
      }
    );

    return () => {
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [accessToken, memberId, armIdleTimer, stopStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || memberId === null || !connectionRef.current) return;

    const userMsg = input.trim();

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsStreaming(true);
    armIdleTimer();

    try {
      // 서버는 202(본문 없음)를 즉시 돌려주고, 답변은 웹소켓으로 보낸다
      await fetcher('/api/v1/chat/send', {
        method: 'POST',
        autoJson: false,
        body: JSON.stringify({
          memberId, // 백엔드 Long 타입
          message: userMsg
        })
      });
    } catch (error) {
      console.error("전송 실패:", error);
      stopStreaming();
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