import express from "express";
import { sendEventNotification } from "../controllers/notificationController.js";

const router = express.Router();

/**
 * @swagger
 * /api/notify:
 *   post:
 *     summary: 이벤트 발생 알림 생성 (프론트가 처리)
 *     description: FCM 발송은 백엔드에서 하지 않고, 프론트에서 직접 처리합니다.
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *                 example: fall
 *               event_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-03T12:30:00Z"
 *     responses:
 *       200:
 *         description: 알림 생성 성공
 */
router.post("/", sendEventNotification);

export default router;
