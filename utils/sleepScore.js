// utils/sleepScore.js

/**
 * 아기 개월 수 계산
 * birthDate: 'YYYY-MM-DD' 문자열
 */
export function getMonthAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  // 날짜까지 고려
  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  return months >= 0 ? months : 0;
}

/**
 * 개월 수에 따른 권장 수면 시간(시간 단위, 중간값 기준)
 */
export function getRecommendedSleepHours(monthAge) {
  if (monthAge <= 3) return 15.5;     // 신생아~3개월
  if (monthAge <= 11) return 13.5;    // 4~11개월
  if (monthAge <= 23) return 12.5;    // 1~2세
  if (monthAge <= 59) return 11.5;    // 2~5세
  return 11.5;                        // fallback
}

/**
 * 총 수면 시간 점수
 * hours: total_sleeptime(float)
 * birthDate: DB 저장된 아기 생일
 */
export function calcSleepDurationScore(hours, birthDate) {
  const monthAge = getMonthAge(birthDate);
  const recommended = getRecommendedSleepHours(monthAge);

  const diff = Math.abs(hours - recommended);

  if (diff <= 0.5) return 100;
  if (diff <= 1) return 90;
  if (diff <= 2) return 75;
  if (diff <= 3) return 50;
  return 30;
}

/**
 * 취침 시간 일관성 점수
 * startTimes: sleep_start 배열
 */
export function calcBedtimeConsistency(startTimes) {
  const times = startTimes.map((t) => {
    const d = new Date(t);
    return d.getHours() + d.getMinutes() / 60; // 시간 단위 (ex: 21.5)
  });

  const max = Math.max(...times);
  const min = Math.min(...times);
  const diff = max - min;

  // 30분 단위 5구간 기준
  if (diff <= 0.5) return 100;     // 30분 이내
  if (diff <= 1) return 90;        // 1시간 이내
  if (diff <= 1.5) return 75;      // 1시간 30분 이내
  if (diff <= 2) return 55;        // 2시간 이내
  return 35;                       // 2시간 이상 차이
}

/**
 * 최종 수면 점수 계산
 * - 총 수면 시간 점수 50%
 * - 취침 시간 일관성 점수 50%
 *
 * records: baby_records 조회 결과
 * baby_birth: 아기 생일
 */
export function calculateFinalSleepScore(records, baby_birth) {
  if (!records || records.length === 0) return 0;

  const sleepHours = records.map((r) => r.total_sleeptime);
  const startTimes = records.map((r) => r.sleep_start);

  const durationScore = calcSleepDurationScore(sleepHours[0], baby_birth);
  const consistencyScore = calcBedtimeConsistency(startTimes);

  const finalScore =
    durationScore * 0.5 +
    consistencyScore * 0.5;

  return Math.round(finalScore);
}
