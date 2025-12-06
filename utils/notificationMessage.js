// utils/notificationMessage.js

function formatKoreanDateTime(date) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");

  const isPM = hours >= 12;
  const period = isPM ? "오후" : "오전";

  // 24h → 12h format
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${year}년 ${month}월 ${day}일 ${period} ${hours}:${minutes}`;
}

export function makeNotificationMessage(eventType, eventTime) {
  const map = {
    movement: "뒤척임이 감지되었습니다",
    fall: "낙상이 감지되었습니다",
  };

  const base = map[eventType] || "이벤트가 감지되었습니다";

  const formatted = formatKoreanDateTime(eventTime);

  return `${base} (${formatted})`;
}
