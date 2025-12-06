// controllers/notificationController.js

import admin from "../config/fcm.js"; // FCM 설정 파일
import User from "../models/userModel.js";

// 오전/오후 시간 변환
const formatKoreanTime = (isoString) => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const h = hours % 12 || 12;

  return `${ampm} ${h}:${minutes.toString().padStart(2, "0")}`;
};

// 2025-12-02 → 2025년 12월 2일
const formatKoreanDate = (isoString) => {
  const d = new Date(isoString);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export const sendNotification = async (req, res) => {
  try {
    const { user_id, event_type, event_time } = req.body;

    if (!user_id || !event_type || !event_time) {
      return res.status(400).json({ message: "필수 값이 없습니다." });
    }

    const user = await User.findById(user_id);
    if (!user || !user.fcm_token) {
      return res.status(404).json({ message: "사용자 또는 FCM 토큰 없음" });
    }

    const prettyTime = formatKoreanTime(event_time);
    const prettyDate = formatKoreanDate(event_time);

    const title =
      event_type === "fall"
        ? "아기가 낙상 위험 상태입니다"
        : "아기 움직임이 감지되었습니다";

    const body =
      `${prettyDate} ${prettyTime}\n` +
      `${event_type === "fall" ? "낙상" : "움직임"} 이벤트가 감지되었습니다.`;

    const message = {
      notification: {
        title,
        body
      },
      token: user.fcm_token,
    };

    await admin.messaging().send(message);

    res.status(200).json({
      message: "알림 전송 완료",
      sent_to: user.fcm_token,
    });
  } catch (error) {
    console.error("sendNotification Error:", error);
    res.status(500).json({ message: "알림 전송 실패", error: error.message });
  }
};
