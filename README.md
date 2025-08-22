# 일정 관리 프론트엔드

> 일정 등록 / 반복 일정 / 일정 추천 / 실시간 알림 / 마이페이지 환경설정 등  
> **실제 사용 가능한 캘린더 기반 일정 관리 서비스의 프론트엔드 구현**


> 실시간 알림, 반복 일정, 일정 추천까지 지원하는  
> **Next.js 기반 일정 관리 서비스 프론트엔드 프로젝트**

---

## 🧰 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **기능 연동** | REST API, Presigned URL, WebSocket |
| **상태관리** | React Context API |
| **기타** | SSR, 다크모드, 반응형 UI 지원 예정 |

---

## ✨ 주요 기능

- 📆 일정 등록/수정/삭제 (카테고리, 반복, 첨부파일 포함)
- ⏰ 일정 충돌 감지 및 반복 주기 설정
- 🧠 AI 기반 일정 추천 (OpenAI 연동)
- 🔔 Kafka + WebSocket 기반 실시간 일정 알림
- 🌓 마이페이지 다크모드, 환경설정 저장
- 📤 S3 Presigned URL 기반 첨부파일 업로드 + 썸네일 렌더링

---

## 📸 주요 화면

### ✅ 일정 등록 화면
![Image](https://github.com/user-attachments/assets/2c6c5b22-7510-4786-90d0-fbf107bb6f6a)

### 📅 캘린더 + 오늘의 일정
![Image](https://github.com/user-attachments/assets/84b8f94b-3135-43c2-b8af-77bd78566f68)

### 👤 마이페이지 (환경 설정 + 통계)
![Image](https://github.com/user-attachments/assets/b89ec9cb-014d-45fe-afe1-9d46e11f00fa)

> 💡 현재 UI는 기능 중심의 MVP로 제작되었으며,  
> 사용성 피드백을 기반으로 Tailwind CSS 리디자인 및 모바일 대응을 진행 중입니다.

---

## 🛠️ 설치 및 실행 방법

```bash
git clone https://github.com/well0924/schedulemanagementProject.git
cd frontend
npm install
npm run dev
```


## 🚧 개선 예정 사항 (TODO)

- [x] Tailwind CSS 기반 UI 컴포넌트 리디자인
- [x] 모바일 반응형 레이아웃 대응
- [ ] 캘린더 UX 개선 (달력 이동, 일정 상세 보기)
- [ ] 에러 / 로딩 상태 처리 개선
- [ ] 사용자 행동 로그 기반 UX 최적화 실험

---

## 🧠 개발 의도 및 설계 방향

이 프로젝트는 단순 CRUD를 넘어서, 운영 환경에서 실시간성과 장애 대응까지 고려한 설계를 목표로 합니다.

프론트는 사용자 편의성과 피드백을 중심으로 구성했습니다.

백엔드는 Kafka, Redis, Presigned URL 등 실무 기술 적극 활용했고

클라이언트-서버 간 보안, 실시간성, 파일 업로드 신뢰성까지 염두했습니다.