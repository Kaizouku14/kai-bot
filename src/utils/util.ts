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


//  function calculateDurationInSeconds(timeStart: Date | string | null | undefined): number {
//     if (!timeStart) return 0;

//     const currentDate = new Date();
//     const startDate = new Date(timeStart);
  
//     const calculatedDuration = currentDate.getTime() - startDate.getTime(); // Corrected: current time - start time

//     if (calculatedDuration < 0) return 0;

//     return Math.floor(calculatedDuration / 1000); // Convert milliseconds to seconds
// }

// export function addDurations(previousDuration: string, newDurationSeconds: number): string {
//     const previousDurationSeconds = durationToSeconds(previousDuration);
//     const totalSeconds = previousDurationSeconds + newDurationSeconds;

//     return secondsToDuration(totalSeconds);
// }

// function durationToSeconds(duration: string): number {
//     const [days, hours, minutes, seconds] = duration.match(/\d+/g)?.map(Number) || [0, 0, 0, 0];
//     return days * 86400 + hours * 3600 + minutes * 60 + seconds;
// }

// function secondsToDuration(totalSeconds: number): string {
//     const secondsInMinute = 60;
//     const secondsInHour = 60 * secondsInMinute;
//     const secondsInDay = 24 * secondsInHour;

//     const days = Math.floor(totalSeconds / secondsInDay);
//     totalSeconds %= secondsInDay;
//     const hours = Math.floor(totalSeconds / secondsInHour);
//     totalSeconds %= secondsInHour;
//     const minutes = Math.floor(totalSeconds / secondsInMinute);
//     const seconds = totalSeconds % secondsInMinute;

//     return `Duration: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
// }
