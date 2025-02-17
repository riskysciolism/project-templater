import { parse } from 'dot-properties';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const packageJsonPath = path.resolve('package.json');
const appinfo = fs.readJsonSync(packageJsonPath);

appinfo.scope = appinfo.name.split('/', 2);
appinfo.basename = appinfo.scope.length > 1 ? appinfo.scope[1] : appinfo.scope[0];

const configFilePath = path.join(os.homedir(), `.${appinfo.basename}`);
let defaults = {
    array: ["value1", "value2"],
    param: "value",
};

/**
 * Loads default settings from a configuration file if it exists.
 */
function initConfig() {
    if (fs.existsSync(configFilePath))
        try {
            defaults = {
                ...defaults,
                ...parse(fs.readFileSync(configFilePath, 'utf8'), true),
            };

            defaults.array = trimAndSplit(defaults.array);
        } catch (error) {
            logMessage('error', 'Error loading defaults from configuration file:', error);
            process.exit(1);
        }
}

/**
 * Trims the input string and splits it into an array, preserving quoted groups.
 * - If the input is an empty string or falsy, it returns an empty array.
 * - If the input is already an array, it returns it as it is.
 * - Preserves values enclosed in double quotes (e.g., `"en=Woodworking business"` remains as one entry).
 *
 * @param {string|string[]} value - The input value to process
 * @returns {string[]} The processed array
 */
function trimAndSplit(value) {
    if (Array.isArray(value)) return value.length === 1 && value[0] === '' ? [] : value;
    if (!value || value.trim() === '') return [];

    // Match quoted groups or standalone words
    const regex = /['"]([^'"]+)['"]|\S+/g;
    // First try to match quoted string, if not exists use complete match
    return [...value.matchAll(regex)]
        .map((match) => (match[1] || match[0]).trim()) // Trim complete match
        .map((entry) => {
            const [key, ...rest] = entry.split('=');
            return rest.length > 0 ? `${key.trim()}=${rest.join('=').trim()}` : key.trim(); // Trim inner leading and trailing whitespaces
        })
        .filter(Boolean);
}

function logMessage(level, ...messages) {
    const colors = {
        error: '\x1b[31m', // Red
        info: '\x1b[34m', // Blue
        reset: '\x1b[0m', // Reset-Color
        success: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
    };

    const logMethods = {
        error: console.error,
        info: console.info,
        success: console.info,
        warn: console.warn,
    };

    const color = colors[level] || colors.reset;
    const logMethod = logMethods[level] || console.info;

    if (level !== 'verbose' || process.env.VERBOSE === 'true')
        logMethod(`${color}${level.toUpperCase()}: ${messages[0]}${colors.reset}`, ...messages.slice(1));
}

// Initialize module
appinfo.scope = appinfo.name.split('/', 2);
appinfo.basename = appinfo.scope.length > 1 ? appinfo.scope[1] : appinfo.scope[0];
appinfo.scope = appinfo.scope.length > 1 ? appinfo.scope[0] : '';
appinfo.version = appinfo.version.split('+')[0];

export { appinfo, defaults, initConfig, logMessage };
