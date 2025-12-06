// routes/notificationRoutes.js
import express from "express";
import { sendNotification } from "../controllers/notificationController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: 모바일 알림 전송 API (모델 서버가 호출함)
 */

/**
 * @swagger
 * /api/notify:
 *   post:
 *     summary: 이벤트 발생 시 알림 전송
 *     description: 모델 서버가 movement / fall 이벤트를 감지했을 때 호출하는 API입니다.
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               event_type:
 *                 type: string
 *                 example: "movement"
 *               event_time:
 *                 type: string
 *                 example: "2025-12-02T12:31:00"
 *     responses:
 *       200:
 *         description: 알림 전송 성공
 *       500:
 *         description: 서버 오류
 */
router.post("/", sendNotification);

export default router;
