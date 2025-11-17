import express from "express";
import { getBabySleepStats } from "../controllers/calendarController.js";

const router = express.Router();

/**
 * @swagger
 * /calendar/stats:
 *   get:
 *     summary: 특정 날짜의 아기 수면/이벤트/수면 품질 통계 조회
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: babyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 아기 ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-20"
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 수면 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSleepTime:
 *                   type: number
 *                   description: 총 수면 시간(분)
 *                 napTime:
 *                   type: number
 *                   description: 낮잠 시간(분)
 *                 eventCount:
 *                   type: integer
 *                   description: 이벤트 발생 횟수
 *                 sleepQuality:
 *                   type: number
 *                   description: 수면 품질 점수
 *       400:
 *         description: babyId 또는 date 누락
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/stats", getBabySleepStats);

export default router;