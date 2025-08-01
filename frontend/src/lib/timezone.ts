/**
 * Chuyển đổi timestamp từ UTC+0 sang UTC+7 (Vietnam time)
 * @param timestamp - Timestamp từ database (UTC+0)
 * @returns Date object với giờ Việt Nam
 */
export function toVietnamTime(timestamp: string | Date): Date {
  const utcDate = new Date(timestamp);
  return new Date(utcDate.getTime() + (7 * 60 * 60 * 1000)); // +7 giờ
}

/**
 * Chuyển đổi timestamp từ UTC+7 về UTC+0 (để gửi lên server)
 * @param timestamp - Timestamp local (UTC+7)
 * @returns Date object với giờ UTC
 */
export function toUTCTime(timestamp: string | Date): Date {
  const localDate = new Date(timestamp);
  return new Date(localDate.getTime() - (7 * 60 * 60 * 1000)); // -7 giờ
} 