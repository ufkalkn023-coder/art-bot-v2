import { setState, getState } from '../services/databaseService.js';
import { CONFIG } from '../config.js';

const MIN_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours

export function shouldRun() {
    if (CONFIG.DRY_RUN) {
        return { allowed: true, reason: "DRY_RUN mode - bypassing schedule check" };
    }

    const lastRunStr = getState('last_run');

    if (!lastRunStr) {
        return { allowed: true, reason: "First run" };
    }

    const lastRun = new Date(lastRunStr);
    const now = new Date();
    const elapsed = now - lastRun;

    if (elapsed < MIN_INTERVAL_MS) {
        const remainingMinutes = Math.ceil((MIN_INTERVAL_MS - elapsed) / 60000);
        return {
            allowed: false,
            reason: `Too soon. Wait ${remainingMinutes} minutes.`
        };
    }

    return { allowed: true, reason: "Interval passed" };
}

export function updateLastRunTime() {
    const now = new Date().toISOString();
    setState('last_run', now);
    console.log("💾 State updated: last_run saved to database.");
}
