export function calculateDuration(startTimestamp, endTimestamp) {
    const start = new Date(startTimestamp);
    const end = new Date(endTimestamp);
  
    // Calculate duration in milliseconds
    const duration = end.getTime() - start.getTime();
  
    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor(duration / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(duration / (1000 * 60)) % 60;
    const seconds = Math.floor(duration / 1000) % 60;
  
    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
 }