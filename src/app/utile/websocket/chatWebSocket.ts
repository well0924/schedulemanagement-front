import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const connectChatWS = (
  memberId: string, 
  accessToken: string,
  onToken: (data: unknown) => void
) => {
  // 1. 반드시 배포된 도메인 주소(Nginx)를 바라보게 설정
  const socket = new SockJS("https://api.schedulemanagement.shop/ws");
  const stompClient = Stomp.over(socket);

  // 로드밸런서 환경에서는 디버그 로그를 켜두는 게 트러블슈팅에 유리해
  stompClient.debug = (str) => console.log('STOMP:', str);

  stompClient.connect(
    { Authorization: `Bearer ${accessToken}` },
    () => {
      // 2. 서버가 2대이므로, 특정 서버에 종속되지 않는 memberId 기반 구독
      stompClient.subscribe(`/topic/chat/${memberId}`, (message) => {
        onToken(JSON.parse(message.body));
      });
    },
    (error: unknown) => {
      console.error("WS 연결 에러 (서버 상태 확인 필요):", error);
      // 서버 한 대가 내려갔을 때 재연결 로직이 있으면 고가용성 점수 Up!
    }
  );

  return stompClient;
};