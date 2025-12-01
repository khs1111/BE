// routes/reportRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import {
  getReports,
  getReportById,
  createLatestReport,
  createReportWithAIRange,
  deleteReportById,
  deleteAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: AI 기반 건강 리포트 API
 */

/**
 * @swagger
 * /api/reports/aiLatest:
 *   post:
 *     summary: 가장 최근 수면 데이터를 기반으로 AI 리포트 생성
 *     description: 가장 최근의 수면 기록 1개와 이벤트 정보를 반영하여 GPT가 건강 리포트를 생성합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 수면 기록 부족
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/aiLatest", auth, createLatestReport);

/**
 * @swagger
 * /api/reports/aiRange:
 *   post:
 *     summary: 원하는 날짜 범위에 대한 수면 기록 기반 AI 리포트 생성
 *     description: start_date ~ end_date 기간 동안의 baby_records를 분석하여 GPT가 리포트를 생성합니다. 이벤트 정보는 반영되지 않습니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-10"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-12"
 *     responses:
 *       201:
 *         description: 리포트 생성 성공
 *       400:
 *         description: 날짜 범위 잘못됨 또는 수면 기록 없음
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/aiRange", auth, createReportWithAIRange);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: 리포트 목록 조회
 *     description: 해당 사용자의 리포트를 최신순으로 반환합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/", auth, getReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: 특정 리포트 조회
 *     description: report id에 해당하는 리포트를 반환합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 리포트 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:id", auth, getReportById);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: 특정 리포트 삭제
 *     description: report id에 해당하는 리포트를 삭제합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 리포트 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/:id", auth, deleteReportById);

/**
 * @swagger
 * /api/reports:
 *   delete:
 *     summary: 전체 리포트 삭제
 *     description: 로그인한 사용자의 모든 리포트를 삭제합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 삭제 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.delete("/", auth, deleteAllReports);

export default router;
