import SockJS from 'sockjs-client';
import { Frame, Stomp } from '@stomp/stompjs';
import { Notification } from '@/app/interfaces/notification/NotificationModel';

export const connectNotificationWS = (
  userId: number | null,
  accessToken: string | null,
  onMessage: (data: Notification) => void
) => {
  // 조건: 토큰과 userId가 없으면 연결하지 않음
  if (!accessToken || userId === null) {
    console.warn("WebSocket 연결 조건 미충족: 로그인 상태 아님");
    return null; // 연결 안 함
  }

  const socket = new SockJS('http://localhost:8080/ws');
  const stompClient = Stomp.over(socket);

  const connectHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  stompClient.connect(
    connectHeaders,
    () => {
      stompClient.subscribe(`/topic/notification/${userId}`, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    },
    (error: Frame | CloseEvent | unknown) => {
      if ('code' in (error as never)) {
        const evt = error as CloseEvent;
        console.error('🟥 WebSocket 종료:', evt.code, evt.reason);
      } else if ('headers' in (error as never)) {
        const frame = error as Frame;
        console.error('🟥 STOMP 에러:', frame.headers['message']);
      } else {
        console.error('🟥 알 수 없는 에러:', error);
      }
    }
  );

  return stompClient;
};
