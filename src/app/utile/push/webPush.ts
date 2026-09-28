// 브라우저 웹 푸시 구독 (1. 서비스 워커 등록 → 2. 알림 권한 요청 → 3. 구독 생성)
// 서버 등록(POST /api/push/subscribe)은 이 결과를 body로 보내는 별도 단계다.

// VAPID 공개키 (공개해도 되는 값). .env.local에 NEXT_PUBLIC_VAPID_PUBLIC_KEY로 설정
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// 서버 NotificationPushRequest와 같은 구조 (memberId는 서버가 로그인 정보로 채움)
export interface BrowserPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}

export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// VAPID 공개키(URL-safe base64)를 pushManager.subscribe가 받는 바이트 배열로 변환
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

// 1. 서비스 워커 등록 (public/sw.js)
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

// 2. 알림 권한 요청 (사용자 클릭 안에서 호출해야 브라우저가 권한 창을 띄운다)
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Notification.permission !== "default") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

// 3. 브라우저 푸시 구독 생성 (이미 구독 중이면 기존 구독 재사용)
export async function subscribeBrowserPush(): Promise<BrowserPushSubscription> {
  if (!isWebPushSupported()) {
    throw new Error("이 브라우저는 웹 푸시를 지원하지 않습니다.");
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID 공개키가 설정되지 않았습니다. (NEXT_PUBLIC_VAPID_PUBLIC_KEY)");
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("알림 권한이 허용되지 않았습니다. 브라우저 설정에서 알림을 허용해 주세요.");
  }

  const registration = await registerServiceWorker();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true, // 받은 푸시는 반드시 알림으로 보여줘야 한다 (브라우저 요구사항)
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const keys = subscription.toJSON().keys ?? {};
  return {
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh ?? "",
    auth: keys.auth ?? "",
    userAgent: navigator.userAgent,
  };
}

// 현재 브라우저의 구독 (토글 초기 상태 확인용)
export async function getBrowserPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  return registration ? registration.pushManager.getSubscription() : null;
}

// 브라우저 구독 해제. 서버 해제(/api/push/unsubscribe)에 쓸 endpoint를 돌려준다
export async function unsubscribeBrowserPush(): Promise<string | null> {
  const subscription = await getBrowserPushSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
