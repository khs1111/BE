// models/reportModel.js
import db from '../config/db.js';

class ReportModel {
  /**
   * 리포트 생성
   */
  static async create({
    user_id,
    report_date,
    recommendation,
    score,
    start_date = null,
    end_date = null,
  }) {
    const sql = `
      INSERT INTO health_reports
      (user_id, report_date, recommendation, score, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      report_date,
      recommendation,
      score,
      start_date,
      end_date,
    ]);

    return {
      id: result.insertId,
      user_id,
      report_date,
      recommendation,
      score,
      start_date,
      end_date,
    };
  }

  /**
   * 특정 사용자 리포트 전체 조회 (최신순)
   */
  static async findByUserId(user_id) {
    const sql = `
      SELECT id, user_id, report_date, recommendation, score, start_date, end_date
      FROM health_reports
      WHERE user_id = ?
      ORDER BY report_date DESC
    `;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  }

  /**
   * 특정 리포트 단건 조회
   */
  static async findById(id) {
    const sql = `
      SELECT id, user_id, report_date, recommendation, score, start_date, end_date
      FROM health_reports
      WHERE id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * 특정 리포트 삭제
   */
  static async delete(id) {
    const sql = `DELETE FROM health_reports WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 특정 유저 리포트 전체 삭제
   */
  static async deleteAll(user_id) {
    const sql = `DELETE FROM health_reports WHERE user_id = ?`;
    const [result] = await db.query(sql, [user_id]);
    return result.affectedRows > 0;
  }
}

export default ReportModel;
