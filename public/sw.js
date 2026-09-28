// 웹 푸시 서비스 워커
// 서버(WebPushService)는 알림 이벤트(NotificationEvents)를 JSON으로 보낸다.
// 예: { "eventId": "...", "receiverId": 1, "scheduleId": 10, "message": "⏰ 일정 리마인드 알림: 회의", "notificationType": "SCHEDULE_REMINDER", ... }

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { message: event.data.text() };
    }
  }

  const title = "일정 알림";
  const options = {
    body: data.message || "새 알림이 있습니다.",
    // 같은 이벤트가 재시도로 여러 번 와도 알림은 하나만 보이도록
    tag: data.eventId || undefined,
    data: { scheduleId: data.scheduleId },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림을 누르면 해당 일정 상세로 이동 (일정 번호가 없으면 메인)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const scheduleId = event.notification.data && event.notification.data.scheduleId;
  const url = scheduleId ? `/calendar/${scheduleId}` : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
