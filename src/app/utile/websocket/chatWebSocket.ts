import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const MAX_RETRY = 5;
const RETRY_DELAY_MS = 3000;

export const connectChatWS = (
  memberId: string, 
  accessToken: string,
  onToken: (data: unknown) => void
) => {
let retryCount = 0;
const connect = () => {
   // 1. 반드시 배포된 도메인 주소(Nginx)를 바라보게 설정
  const socket = new SockJS("https://api.schedulemanagement.shop/ws");
  const stompClient = Stomp.over(socket);

  // 로드밸런서 환경에서는 디버그 로그를 켜두는 게 트러블슈팅에 유리해
  stompClient.debug = process.env.NODE_ENV === 'development' 
    ? (str) => console.log('STOMP:', str)
    : () => {};
  stompClient.connect(
    { Authorization: `Bearer ${accessToken}` },
    () => {
      retryCount = 0; // 연결 성공 시 재시도 횟수 초기화
      // 2. 서버가 2대이므로, 특정 서버에 종속되지 않는 memberId 기반 구독
      stompClient.subscribe(`/topic/chat/${memberId}`, (message) => {
        onToken(JSON.parse(message.body));
      });
    },
    (error: unknown) => {
      console.error("WS 연결 에러 (서버 상태 확인 필요):", error);
      if (retryCount < MAX_RETRY) {
          retryCount++;
          console.log(`재연결 시도 ${retryCount}/${MAX_RETRY} (${RETRY_DELAY_MS}ms 후)`);
          setTimeout(connect, RETRY_DELAY_MS);
      } else {
          console.error("최대 재연결 횟수 초과. 연결을 포기합니다.");
      }
    }
  );
  return stompClient;
};

  return connect();
};