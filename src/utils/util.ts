import { Duration } from "../interfaces/UserData";

/**
 * Calculate the duration between the given start time and the current time.
 *
 * Returns an object with days, hours, minutes, and seconds properties.
 *
 * If the start time is invalid or in the future, returns an object with all properties set to 0.
 *
 * @param {Date | string | null | undefined} timeStart The start time to calculate the duration from.
 * @returns {Duration}
 */
export function calculateDuration(timeStart: Date | string | null | undefined): Duration {
    if (!timeStart) return { days: 0, hours: 0, minutes: 0, seconds: 0 }; // Return default values for invalid start time

    const currentDate = new Date();
    const startDate = new Date(timeStart);
    const calculatedDuration = currentDate.getTime() - startDate.getTime();

    if (calculatedDuration < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }; // Return default values for invalid start time

    const secondsInMinute = 60;
    const secondsInHour = 60 * secondsInMinute;
    const secondsInDay = 24 * secondsInHour;

    let remainingSeconds = Math.floor(calculatedDuration / 1000); // Convert milliseconds to seconds

    const days = Math.floor(remainingSeconds / secondsInDay);
    remainingSeconds %= secondsInDay;
    const hours = Math.floor(remainingSeconds / secondsInHour);
    remainingSeconds %= secondsInHour;
    const minutes = Math.floor(remainingSeconds / secondsInMinute);
    remainingSeconds %= secondsInMinute;
    const seconds = remainingSeconds;

    return { days, hours, minutes, seconds };
}

/**
 * Adds two durations together and returns the result.
 *
 * @param {Duration} oldDuration The first duration to add.
 * @param {Duration} newDuration The second duration to add.
 * @returns {Duration} The result of adding the two durations.
 * @example
 * const duration1 = { days: 1, hours: 2, minutes: 3, seconds: 4 };
 * const duration2 = { days: 5, hours: 6, minutes: 7, seconds: 8 };
 * const result = addDurations(duration1, duration2);
 * // result is { days: 6, hours: 8, minutes: 10, seconds: 12 }
 */
export function addDurations(oldDuration: Duration, newDuration: Duration): Duration {
    const totalSeconds = oldDuration.seconds + newDuration.seconds;
    const totalMinutes = oldDuration.minutes + newDuration.minutes + Math.floor(totalSeconds / 60);
    const totalHours = oldDuration.hours + newDuration.hours + Math.floor(totalMinutes / 60);
    const totalDays = oldDuration.days + newDuration.days + Math.floor(totalHours / 24);

    return {
        days: totalDays,
        hours: totalHours % 24,
        minutes: totalMinutes % 60,
        seconds: totalSeconds % 60,
    };
}

    /**
     * Parse a string duration into milliseconds.
     *
     * Accepted formats are:
     *   - `Xs` for seconds
     *   - `Xm` for minutes
     *   - `Xh` for hours
     *   - `Xd` for days
     *
     * Returns null if the format is invalid.
     * @param {string} duration
     * @returns {number | null}
     */
export function parseDuration(duration: string): number | null {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return null;
  
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
  
    switch (unit) {
      case 's': return value * 1000;        // seconds to milliseconds
      case 'm': return value * 60 * 1000;   // minutes to milliseconds
      case 'h': return value * 60 * 60 * 1000; // hours to milliseconds
      case 'd': return value * 24 * 60 * 60 * 1000; // days to milliseconds
      default: return null;
    }
  }