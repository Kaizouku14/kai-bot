import { EmbedBuilder } from "discord.js";
import { Duration } from "../interfaces/UserData";
import { updateRank } from "./violationStats";

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

    /**
     * Checks if the given user has reached a milestone count and returns an embed accordingly.
     * Milestones are:
     *   - 50: Veteran
     *   - 101: Legend
     *   - 501: Master
     *   - 1001: THE GOAT
     *
     * Returns null if no milestone is reached.
     * @param {string} userId The user's ID to check.
     * @param {string} username The user's name to mention in the embed.
     * @param {number} count The current count to check against.
     * @returns {MessageEmbed | null}
     */
export const checkMilestone = async (userId : string, username : string , count : number) => {
    if (count < 50) return null;

    const ranks = [
        { min: 50, max: 100, rank: 'Veteran' },
        { min: 101, max: 500, rank: 'Legend' },
        { min: 501, max: 1000, rank: 'Master' },
        { min: 1001, max: Infinity, rank: 'THE GOAT' }
    ];

    for (const { min, max, rank } of ranks) {
        if (count >= min && count <= max) {
            try {
                await updateRank(userId, rank);

                const description = `Hey ${username}, you've reached a count of \`${count}\`! Keep it up!`;
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Achievement 🎉')
                    .setColor('#0099ff')
                    .setDescription(description)
                    .addFields({ name: 'Milestone', value: rank, inline: true });
                
                return embed;
            } catch (error) {
                console.error('Error updating rank:', error);
            }
        }
    }

    return null; 
};

export const WelcomeUser = (username : string) => {
    const description = `Hey \`${username}\`, congratulations! You've become a racist; keep it up!`;
    const embed = new EmbedBuilder()
        .setTitle('🎉 Achievement Unlocked 🎉')
        .setColor('#0099ff')
        .setDescription(description)
        .addFields({ name: 'Newbie', value: 'New racist found!', inline: true });

    return embed;             
}


export const getGreetingMessage = (message : string) => {
    if (message.match(/good\s*morning/i)) {
        return "Good morning! My nigga! Hope you have a great start to your day!";
    } else if (message.match(/good\s*afternoon/i)) {
        return "Good afternoon! My nigga, hope your day is going well!";
    } else if (message.match(/good\s*evening/i)) {
        return "Good evening! My nigga, I hope you're winding down well!";
    } else if (message.match(/good\s*night/i)) {
        return "Good night! Sleep well and have sweet dreams! My nigga";
    }

    return null;
}
