// Service to decide if a scheduled Mini Exhibition should run now
import { CONFIG } from '../config.js';
import { parse } from 'date-fns';

/**
 * Returns true if today matches the configured schedule.
 * For simplicity we support "first Monday of month at HH:MM" format.
 * CONFIG.SCHEDULED_EXHIBITION = { dayOfWeek: 1, weekOfMonth: 1, hour: 9, minute: 0 }
 */
export function shouldRunNow() {
    const schedule = CONFIG.SCHEDULED_EXHIBITION;
    if (!schedule) return false;

    const now = new Date();
    // Check hour/minute
    if (now.getHours() !== schedule.hour || now.getMinutes() !== schedule.minute) {
        return false;
    }

    // Determine week of month (1 = first week)
    const day = now.getDate();
    const weekOfMonth = Math.ceil(day / 7);

    return now.getDay() === schedule.dayOfWeek && weekOfMonth === schedule.weekOfMonth;
}
