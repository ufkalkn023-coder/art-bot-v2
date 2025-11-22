import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve('logs');
const LOG_FILE = path.join(LOG_DIR, 'bot.log');

function getTimestamp() {
    return new Date().toISOString();
}

function writeLog(level, message, data = null) {
    const logEntry = {
        timestamp: getTimestamp(),
        level,
        message,
        ...(data && { data })
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
        console.error("Failed to write log:", error.message);
    }
}

export function logInfo(message, data) {
    console.log(`ℹ️  ${message}`);
    writeLog('INFO', message, data);
}

export function logWarn(message, data) {
    console.warn(`⚠️  ${message}`);
    writeLog('WARN', message, data);
}

export function logError(message, error) {
    console.error(`❌ ${message}`, error);
    writeLog('ERROR', message, {
        error: error.message,
        stack: error.stack
    });
}

export function logSuccess(message, data) {
    console.log(`✅ ${message}`);
    writeLog('SUCCESS', message, data);
}
