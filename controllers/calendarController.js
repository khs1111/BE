import {
  getTotalSleepTime,
  getNapTime,
  getFallCount,
  getMovementCount,
  getSleepQuality
} from '../models/calendarModel.js';

const getBabySleepStats = async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ error: 'userId와 date는 필수입니다.' });
    }

    const totalSleepTime = await getTotalSleepTime(userId, date);
    const napTime = await getNapTime(userId, date);
    const fallCount = await getFallCount(userId, date);
    const movementCount = await getMovementCount(userId, date);
    const sleepQuality = await getSleepQuality(userId, date);

    return res.status(200).json({
      totalSleepTime,
      napTime,
      fallCount,
      movementCount,
      sleepQuality
    });
  } catch (error) {
    console.error('수면 통계 조회 에러:', error);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

export { getBabySleepStats };
