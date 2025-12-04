// 아기 개월 수 계산
export function getMonthAge(birthDate) {
  if (!birthDate) return 0;

  const today = new Date();
  const birth = new Date(birthDate);

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) months -= 1;

  return months >= 0 ? months : 0;
}

// 개월 수 기준 권장 수면시간
export function getRecommendedSleepHours(monthAge) {
  if (monthAge <= 3) return 15.5;
  if (monthAge <= 11) return 13.5;
  if (monthAge <= 23) return 12.5;
  if (monthAge <= 59) return 11.5;
  return 11.5;
}

// 총 수면시간 점수
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

// 취침시간 편차 점수 (30분 단위)
export function calcBedtimeConsistency(startTimes) {
  if (!startTimes || startTimes.length === 0) return 0;

  const times = startTimes.map((t) => {
    const d = new Date(t);
    return d.getHours() + d.getMinutes() / 60;
  });

  const diff = Math.max(...times) - Math.min(...times);

  if (diff <= 0.5) return 100;
  if (diff <= 1) return 90;
  if (diff <= 1.5) return 75;
  if (diff <= 2) return 55;
  return 35;
}

// 이벤트(뒤척임 & 낙상) 점수
export function calcEventRiskScore({ movementCount = 0, fallCount = 0 }) {
  // 낙상 위험 점수
  let fallScore = 0;
  if (fallCount === 0) fallScore = 10;
  else if (fallCount === 1) fallScore = 5;
  else fallScore = 0;

  // 뒤척임 점수
  let movementScore = 0;
  if (movementCount <= 2) movementScore = 10;
  else if (movementCount <= 5) movementScore = 7;
  else if (movementCount <= 10) movementScore = 3;
  else movementScore = 1;

  return fallScore + movementScore; // 총 20점
}

/*
  records 예시:
  latest: [{ total_sleeptime, sleep_start }]
  range:  [{ total_sleeptime, first_sleep_start }]
*/
export function calculateFinalSleepScore(records, baby_birth, eventCounts = {}) {
  if (!records || records.length === 0) return 0;

  const sleepHours = records.map((r) => r.total_sleeptime);
  const startTimes = records.map(
    (r) => r.sleep_start || r.first_sleep_start
  );

  // 총 수면 시간 점수 (100점 max)
  const durationScore = calcSleepDurationScore(
    sleepHours[0],
    baby_birth
  );

  // 취침 시간 편차 점수 (100점 max)
  const consistencyScore = calcBedtimeConsistency(startTimes);

  // 이벤트 점수 (20점 max)
  const eventScore = calcEventRiskScore(eventCounts);

  // 비율 적용
  return Math.round(
    durationScore * 0.4 +      // 40%
    consistencyScore * 0.4 +   // 40%
    eventScore * 0.2           // 20%
  );
}
