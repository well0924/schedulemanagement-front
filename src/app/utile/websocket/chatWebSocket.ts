import { CompatClient, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const MAX_RETRY = 5;
const RETRY_DELAY_MS = 3000;

// 재연결하면 STOMP 클라이언트가 새로 만들어지므로, 항상 마지막 클라이언트를 끊을 수 있는 핸들을 돌려준다
export interface ChatConnection {
  disconnect: () => void;
}

export const connectChatWS = (
  memberId: number,
  accessToken: string,
  onToken: (data: unknown) => void
): ChatConnection => {
  let retryCount = 0;
  let current: CompatClient | null = null;
  let closed = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (closed) return;
    // 배포된 도메인 주소(Nginx)를 바라보게 설정
    const socket = new SockJS(`https://api.schedulemanagement.shop/ws?token=${encodeURIComponent(accessToken)}`);
    const stompClient = Stomp.over(socket);
    current = stompClient;

    stompClient.debug = process.env.NODE_ENV === 'development'
      ? (str) => console.log('STOMP:', str)
      : () => {};
    stompClient.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        retryCount = 0; // 연결 성공 시 재시도 횟수 초기화
        // 특정 서버에 종속되지 않는 memberId 기반 구독
        stompClient.subscribe(`/topic/chat/${memberId}`, (message) => {
          onToken(JSON.parse(message.body));
        });
      },
      (error: unknown) => {
        console.error("WS 연결 에러 (서버 상태 확인 필요):", error);
        if (closed) return;
        if (retryCount < MAX_RETRY) {
          retryCount++;
          console.log(`재연결 시도 ${retryCount}/${MAX_RETRY} (${RETRY_DELAY_MS}ms 후)`);
          retryTimer = setTimeout(connect, RETRY_DELAY_MS);
        } else {
          console.error("최대 재연결 횟수 초과. 연결을 포기합니다.");
        }
      }
    );
  };

  connect();

  return {
    disconnect: () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (current?.connected) current.disconnect();
    },
  };
};
