// controllers/notificationController.js

// 날짜/시간 포맷 함수
function formatTimeToKorean(date) {
  const d = new Date(date);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // 예: "오후 9:14"
}

function formatDateToKorean(date) {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }); // 예: "2025년 12월 3일"
}

export const sendEventNotification = async (req, res) => {
  try {
    const { event_type, event_time } = req.body;

    if (!event_type || !event_time) {
      return res.status(400).json({ message: "event_type, event_time이 필요합니다." });
    }

    // 메시지 변환
    const timeText = formatTimeToKorean(event_time);
    const dateText = formatDateToKorean(event_time);

    let alertText = "";

    if (event_type === "fall") {
      alertText = `${dateText} ${timeText} 아기가 넘어짐이 감지되었어요.`;
    } else if (event_type === "movement") {
      alertText = `${dateText} ${timeText} 아기의 뒤척임이 감지되었어요.`;
    } else {
      alertText = `${dateText} ${timeText} 이벤트(${event_type})가 발생했어요.`;
    }

    // 프론트로 알림 문구 전달
    return res.status(200).json({
      message: "이벤트 알림 생성",
      notification: alertText,
      raw: {
        event_type,
        event_time,
      },
    });
  } catch (err) {
    console.error("sendEventNotification error:", err);
    return res.status(500).json({ message: "알림 생성 실패" });
  }
};
