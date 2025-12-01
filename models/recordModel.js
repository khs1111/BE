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
   * 가장 최근 수면 기록 1개 조회 (리포트 타입 1)
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
   * 날짜 범위 전체 수면 기록 조회 (리포트 타입 2)
   * start_date, end_date: 'YYYY-MM-DD'
   * → start_date 00:00:00 ~ end_date 23:59:59
   */
  findByDateRange: async (userId, start_date, end_date) => {
    const sql = `
      SELECT *
      FROM baby_records
      WHERE user_id = ?
      AND sleep_start >= ?
      AND sleep_end < DATE_ADD(?, INTERVAL 1 DAY)
      ORDER BY sleep_start ASC
    `;
    const [rows] = await db.query(sql, [userId, start_date, end_date]);
    return rows;
  },
};

export default Record;