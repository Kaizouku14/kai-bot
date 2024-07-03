import { Duration } from "../interfaces/UserData";

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