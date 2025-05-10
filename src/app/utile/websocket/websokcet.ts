import SockJS from 'sockjs-client';
import { Frame, Stomp } from '@stomp/stompjs';
import { Notification } from '@/app/interfaces/notification/NotificationModel';


export const connectNotificationWS = (
    userId: number,
    accessToken: string,
    onMessage: (data: Notification) => void
  ) => {
    const socket = new SockJS('http://localhost:8080/ws'); // 이게 맞음 → /ws
  
    const stompClient = Stomp.over(socket);
  
    stompClient.connect(
      {
        Authorization: `Bearer ${accessToken}` // 헤더에 JWT 포함!
      },
      () => {
        stompClient.subscribe(`/topic/notification/${userId}`, (message) => {
          const data = JSON.parse(message.body);
          onMessage(data);
        });
      },
      (error: Frame | CloseEvent | unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('code' in (error as any)) {
          const evt = error as CloseEvent;
          console.error('🟥 WebSocket 종료:', evt.code, evt.reason);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if ('headers' in (error as any)) {
          const frame = error as Frame;
          console.error('🟥 STOMP 에러:', frame.headers['message']);
        } else {
          console.error('🟥 알 수 없는 에러:', error);
        }
      }
    );
  
    return stompClient;
  };