// controllers/graphController.js

import Record from '../models/recordModel.js';
import User from '../models/mypageModel.js';
import db from "../config/db.js";
import { calculateFinalSleepScore } from "../utils/sleepScore.js";

/**
 * 그래프용 데이터 반환
 * - 하루 total sleep
 * - movement count
 * - sleep score
 */
export const getGraphData = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const user_id = req.user.id;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date, end_date는 필수입니다." });
    }

    // 1) 밤잠/낮잠 기준 합산 수면데이터
    const dailyRecords = await Record.findDailyTotalSleep(
      user_id,
      start_date,
      end_date
    );

    if (!dailyRecords || dailyRecords.length === 0) {
      return res.status(400).json({ message: "해당 기간 수면 데이터가 없습니다." });
    }

    // 2) 아기 생일 → score 계산에 필요
    const user = await User.findUserById(user_id);
    const baby_birth = user?.baby_birthday ?? null;

    const sleepHoursGraph = [];
    const movementGraph = [];
    const scoreGraph = [];

    for (const record of dailyRecords) {
      const targetDate = record.sleep_date;
      const sleepHours = record.total_sleeptime;

      // movement count 조회
      const [movementRows] = await db.execute(
        `SELECT COUNT(*) AS cnt
         FROM events
         WHERE user_id = ?
         AND event_type = 'movement'
         AND DATE(event_time) = ?`,
        [user_id, targetDate]
      );

      const movementCount = movementRows[0]?.cnt ?? 0;

      // score 계산
      const score = calculateFinalSleepScore(
        [record],
        baby_birth
      );

      // 그래프용 배열에 적재
      sleepHoursGraph.push({
        date: targetDate,
        hours: sleepHours,
      });

      movementGraph.push({
        date: targetDate,
        count: movementCount,
      });

      scoreGraph.push({
        date: targetDate,
        score,
      });
    }

    return res.status(200).json({
      message: "그래프 데이터 조회 성공",
      data: {
        sleepHours: sleepHoursGraph,
        movement: movementGraph,
        score: scoreGraph,
      },
    });

  } catch (err) {
    console.error("getGraphData error:", err);
    res.status(500).json({
      message: "그래프 데이터 조회 실패",
      error: err.message,
    });
  }
};
