// models/recordModel.js
import db from '../config/db.js';

const Record = {
  /**
   * 수면 기록 생성
   */
  create: async ({
    user_id,
    sleep_start,
    sleep_end,
    video_url = null,
    total_sleeptime = null,
  }) => {
    const sql = `
      INSERT INTO baby_records
      (user_id, sleep_start, sleep_end, video_url, total_sleeptime, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(sql, [
      user_id,
      sleep_start,
      sleep_end,
      video_url,
      total_sleeptime,
    ]);

    return {
      id: result.insertId,
      user_id,
      sleep_start,
      sleep_end,
      video_url,
      total_sleeptime,
    };
  },

  /**
   * 가장 최근 수면 기록 1개 조회
   */
  findLatestByUserId: async (userId) => {
    const sql = `
      SELECT *
      FROM baby_records
      WHERE user_id = ?
      ORDER BY sleep_start DESC
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows[0] || null;
  },

  /**
   * 날짜 범위에 대해
   * 밤잠/낮잠 판별을 적용하여
   * 하루 total_sleeptime을 합산한 결과를 반환
   */
  findDailyTotalSleep: async (userId, start_date, end_date) => {
    const sql = `
      SELECT
        DATE(
          CASE
            WHEN TIME(sleep_start) BETWEEN '18:00:00' AND '23:59:59'
              THEN sleep_start
            WHEN TIME(sleep_start) BETWEEN '00:00:00' AND '08:59:59'
              THEN DATE_SUB(sleep_start, INTERVAL 1 DAY)
            ELSE sleep_start
          END
        ) AS sleep_date,

        SUM(
          TIMESTAMPDIFF(SECOND, sleep_start, sleep_end)
        ) / 3600 AS total_sleeptime,

        MIN(sleep_start) AS first_sleep_start

      FROM baby_records
      WHERE user_id = ?
        AND sleep_start >= ?
        AND sleep_end <= DATE_ADD(?, INTERVAL 1 DAY)
        AND sleep_start IS NOT NULL
        AND sleep_end IS NOT NULL

      GROUP BY sleep_date
      ORDER BY sleep_date ASC
    `;

    const [rows] = await db.query(sql, [
      userId,
      start_date,
      end_date,
    ]);

    return rows;
  },

  /**
   * 이벤트 조회 (최근 리포트에서만 사용)
   */
  findEventsWithinRange: async (user_id, start, end) => {
    const sql = `
      SELECT event_time, event_type
      FROM events
      WHERE user_id = ?
        AND event_time >= ?
        AND event_time <= ?
      ORDER BY event_time ASC
    `;
    const [rows] = await db.query(sql, [user_id, start, end]);
    return rows;
  },
};

export default Record;
