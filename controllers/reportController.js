// controllers/reportController.js
import Report from '../models/reportModel.js';
import Record from '../models/recordModel.js';
import db from "../config/db.js";
import OpenAI from "openai";
import { calculateFinalSleepScore } from "../utils/sleepScore.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** 날짜 'YYYY-MM-DD' 변환 */
const toDateString = (value) =>
  new Date(value).toISOString().split("T")[0];

/** 특정 수면 구간 동안 발생한 이벤트 조회 (최근 리포트만 사용) */
const findEventsWithinRange = async (user_id, start, end) => {
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
};

/**
 * 리포트 전체 조회
 */
export const getReports = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const reports = await Report.findByUserId(req.user.id);

    res.status(200).json({
      message: "리포트 조회 성공",
      reports,
    });
  } catch (error) {
    console.error("getReports error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

/**
 * 특정 리포트 조회
 */
export const getReportById = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "리포트를 찾을 수 없습니다." });
    }

    if (report.user_id !== req.user.id) {
      return res.status(403).json({ message: "본인만 조회할 수 있습니다." });
    }

    res.status(200).json({
      message: "리포트 상세 조회 성공",
      report,
    });
  } catch (error) {
    console.error("getReportById error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

/**
 * 특정 리포트 삭제
 */
export const deleteReportById = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "리포트가 존재하지 않습니다." });
    }

    if (report.user_id !== req.user.id) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    const deleted = await Report.delete(id);

    res.status(200).json({
      message: "리포트 삭제 완료",
    });
  } catch (error) {
    console.error("deleteReportById error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

/**
 * 해당 사용자의 리포트 전체 삭제
 */
export const deleteAllReports = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const result = await Report.deleteAll(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "삭제할 리포트가 없습니다." });
    }

    res.status(200).json({
      message: "해당 사용자의 모든 리포트가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("deleteAllReports error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

/* 최근 기록 기반 리포트 (이벤트 포함) */
export const createLatestReport = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const user_id = req.user.id;

    // 가장 최근 수면 기록 가져오기
    const latest = await Record.findLatestByUserId(user_id);

    if (!latest) {
      return res.status(400).json({ message: "수면 기록이 존재하지 않습니다." });
    }

    const sleepStart = new Date(latest.sleep_start);
    const sleepEnd = new Date(latest.sleep_end);

    // 총 수면 시간 계산
    const fallbackHours = (sleepEnd - sleepStart) / (1000 * 60 * 60);
    const totalSleep = latest.total_sleeptime ?? fallbackHours;

    // 이벤트 조회
    const events = await findEventsWithinRange(
      user_id,
      latest.sleep_start,
      latest.sleep_end
    );

    const eventText = events.length
      ? events
          .map(
            (e) =>
              `  - ${new Date(e.event_time).toLocaleString("ko-KR")} : ${e.event_type}`
          )
          .join("\n")
      : "  - 이 기간 동안 이벤트가 기록되지 않았습니다.";

    const recordsText = `
· 수면: ${sleepStart.toLocaleString("ko-KR")} ~ ${sleepEnd.toLocaleString("ko-KR")}
· 총 수면 시간: 약 ${totalSleep.toFixed(1)}시간
· 수면 중 이벤트 발생 ${events.length}건:
${eventText}
`.trim();

    const finalScore = calculateFinalSleepScore([latest]);

    const prompt = `
당신은 아동 수면 건강 전문가입니다.
아래의 최근 수면 기록을 분석하여 보호자에게 보고서를 작성하세요.

최근 수면 기록:
${recordsText}

---

# 출력 형식:

## 수면 패턴 분석
- 최근 기록을 기반으로 아이의 수면 상태를 3~5가지 bullet로 요약하세요.
- 수면 시간, 뒤척임, 패턴 변화 등 데이터 기반으로 설명하세요.
- bullet 중 최소 1개 이상은 총 수면 시간에 대한 분석을 포함하세요.
- bullet 중 최소 1개 이상은 수면 중 발생한 이벤트의 종류(event_type column)에 대한 분석을 포함하세요.

## 개선 권장사항
- 보호자가 바로 적용할 수 있는 실천 팁을 bullet로 3~5개 작성하세요.
- 문장은 간단하고 따뜻하게, "해보세요" 같은 제안형으로 작성하세요.

반드시 두 섹션 제목과 bullet 포맷을 그대로 유지하세요.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiRecommendation =
      completion.choices[0].message.content.trim();

    const newReport = await Report.create({
      user_id,
      report_date: toDateString(new Date()),
      recommendation: aiRecommendation,
      score: finalScore,
      start_date: toDateString(latest.sleep_start),
      end_date: toDateString(latest.sleep_end),
    });

    res.status(201).json({
      message: "최근 수면 데이터 기반 리포트가 생성되었습니다.",
      report: newReport,
    });
  } catch (error) {
    console.error("createLatestReport error:", error);
    res.status(500).json({ message: "AI 리포트 생성 실패", error: error.message });
  }
};

/* 날짜 범위 리포트 (이벤트 반영 X) */
export const createReportWithAIRange = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const user_id = req.user.id;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date, end_date는 반드시 필요합니다." });
    }

    const records = await Record.findByDateRange(user_id, start_date, end_date);

    if (!records || records.length === 0) {
      return res.status(400).json({ message: "해당 기간에 수면 기록이 존재하지 않습니다." });
    }

    const finalScore = calculateFinalSleepScore(records);

    const recordsText = records
      .map((r, idx) => {
        const start = new Date(r.sleep_start);
        const end = new Date(r.sleep_end);
        const duration = (end - start) / (1000 * 60 * 60);
        const totalSleep = r.total_sleeptime ?? duration;

        return `· [${idx + 1}] 수면: ${start.toLocaleString(
          "ko-KR"
        )} ~ ${end.toLocaleString(
          "ko-KR"
        )} / 총수면시간 약 ${totalSleep.toFixed(1)}시간`;
      })
      .join("\n");

    const prompt = `
당신은 아동 수면 건강 전문가입니다.
아래의 수면 기록을 분석하여 보호자에게 보고서를 작성하세요.

수면 기록:
${recordsText}

---

# 출력 형식:

## 수면 패턴 분석
- 해당 기간 수면 데이터를 기반으로 아이의 수면 상태를 3~5가지 bullet로 요약하세요.
- 수면 시간, 패턴 변화 등 데이터 기반으로 설명하세요.
- bullet 중 최소 1개 이상은 해당 기간의 평균 수면 시간, 총 수면 시간, 또는 수면량 변화 분석을 포함하세요.

## 개선 권장사항
- 보호자가 바로 적용할 수 있는 실천 팁을 bullet로 3~5개 작성하세요.
- 문장은 간단하고 따뜻하게, "해보세요" 같은 제안형으로 작성하세요.

반드시 두 섹션 제목과 bullet 포맷을 그대로 유지하세요.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiRecommendation =
      completion.choices[0].message.content.trim();

    const newReport = await Report.create({
      user_id,
      report_date: toDateString(new Date()),
      recommendation: aiRecommendation,
      score: finalScore,
      start_date,
      end_date,
    });

    res.status(201).json({
      message: "기간 기반 수면 데이터 리포트가 생성되었습니다.",
      report: newReport,
    });
  } catch (error) {
    console.error("createReportWithAIRange error:", error);
    res.status(500).json({ message: "AI 리포트 생성 실패", error: error.message });
  }
};
