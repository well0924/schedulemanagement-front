import SockJS from 'sockjs-client';
import { Frame, Stomp } from '@stomp/stompjs';
import { Notification } from '@/app/utile/interfaces/notification/NotificationModel';

const MAX_RETRY = 5;
const RETRY_DELAY_MS = 3000;

export const connectNotificationWS = (
  memberId: number | null,
  accessToken: string | null,
  onMessage: (data: Notification) => void
) => {
  // 조건: 토큰과 memberId가 없으면 연결하지 않음
  if (!accessToken || memberId === null) {
    console.warn("WebSocket 연결 조건 미충족: 로그인 상태 아님");
    return null; // 연결 안 함
  }
  
  let retryCount = 0;
  const connect = () => {
    const socket = new SockJS("https://api.schedulemanagement.shop/ws");
    const stompClient = Stomp.over(socket);

    stompClient.debug = process.env.NODE_ENV === 'development'
      ? (str) => console.log('STOMP:', str)
      : () => {};

    stompClient.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        retryCount = 0;
        stompClient.subscribe(`/topic/notifications/${memberId}`, (message) => {
          const data = JSON.parse(message.body);
          onMessage(data);
        });
      },
      (error: Frame | CloseEvent | unknown) => {
        if ('code' in (error as never)) {
          const evt = error as CloseEvent;
          console.error('WebSocket 종료:', evt.code, evt.reason);
        } else if ('headers' in (error as never)) {
          const frame = error as Frame;
          console.error('STOMP 에러:', frame.headers['message']);
        } else {
          console.error('알 수 없는 에러:', error);
        }

        if (retryCount < MAX_RETRY) {
          retryCount++;
          console.log(`재연결 시도 ${retryCount}/${MAX_RETRY} (${RETRY_DELAY_MS}ms 후)`);
          setTimeout(connect, RETRY_DELAY_MS);
        } else {
          console.error("최대 재연결 횟수 초과.");
        }
      }
    );

    return stompClient;
  };

  return connect();
};
