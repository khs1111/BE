import { getBabyInfo } from "../models/babyinfoModel.js";

export const fetchBabyInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId는 필수입니다." });
    }

    const babyInfo = await getBabyInfo(userId);

    if (!babyInfo) {
      return res.status(404).json({ error: "해당 사용자의 아기 정보가 없습니다." });
    }

    return res.status(200).json(babyInfo);
  } catch (error) {
    console.error("아기 정보 조회 실패:", error);
    return res.status(500).json({ error: "서버 오류 발생" });
  }
};