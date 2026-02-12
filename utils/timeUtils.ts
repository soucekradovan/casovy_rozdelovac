
/**
 * Converts HH:mm string to minutes from the start of the day.
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes to HH:mm string.
 */
export const minutesToTime = (totalMinutes: number): string => {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes % 1) * 60);
  
  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  
  if (seconds > 0) {
    const sStr = seconds.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }
  
  return `${hStr}:${mStr}`;
};

/**
 * Formats duration in minutes into a human-readable string.
 */
export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};
