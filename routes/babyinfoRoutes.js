import express from "express";
import { fetchBabyInfo } from "../controllers/babyinfoController.js";

const router = express.Router();

/**
 * @swagger
 * /baby/info:
 *   get:
 *     summary: 아기 정보 조회
 *     tags: [Baby]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: 사용자 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 아기 정보 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               babyname: "아기천사"
 *               babygender: "M"
 *               baby_birthday: "2024-03-12"
 *       400:
 *         description: userId 없음
 *       404:
 *         description: 데이터 없음
 */
router.get("/info", fetchBabyInfo);

export default router;