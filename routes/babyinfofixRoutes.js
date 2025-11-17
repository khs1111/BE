import express from "express";
import { updateBabyInfoController } from "../controllers/babyinfofixController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BabyInfoFix
 *   description: 아기 정보 수정 API
 */

/**
 * @swagger
 * /babyfix:
 *   put:
 *     summary: 아기 정보 수정
 *     tags: [Baby]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 1
 *             babyname: "초코"
 *             babygender: "F"
 *             baby_birthday: "2024-03-10"
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             example:
 *               message: "아기 정보가 성공적으로 수정되었습니다."
 *       400:
 *         description: 요청 값 부족
 *       500:
 *         description: 서버 오류
 */
router.put("/", updateBabyInfoController);

export default router;