// 백엔드 API 주소. 배포 환경마다 NEXT_PUBLIC_API_BASE_URL로 바꿀 수 있고, 없으면 운영 주소를 쓴다.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.schedulemanagement.shop";
