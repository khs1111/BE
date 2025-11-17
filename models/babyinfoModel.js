import pool from "../config/db.js";

// user_id 로 아기 정보 조회
export const getBabyInfo = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT babyname, babygender, baby_birthday
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("아기 정보 조회 오류:", error);
    throw error;
  }
};