/**
 * Storage Module
 * Handles localStorage operations for the application
 */

const STORAGE_KEY = 'deviceConfig';
const LANGUAGE_KEY = 'language';

/**
 * Save configuration to localStorage
 * @param {Object} config - Configuration object
 * @param {Array} schedules - Schedules array
 */
export function saveToLocalStorage(config, schedules) {
    try {
        const data = {
            config: config,
            schedules: schedules
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Load configuration from localStorage
 * @returns {Object} Object containing config and schedules
 */
export function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return {
            config: {
                deviceIP: '',
                time: false,
                wifiName: '',
                wifiPassword: '',
                channelNames: Array(8).fill('')
            },
            schedules: []
        };
    }

    try {
        const data = JSON.parse(savedData);

        // Initialize default config structure
        const config = {
            deviceIP: '',
            time: false,
            wifiName: '',
            wifiPassword: '',
            channelNames: Array(8).fill('')
        };

        // Merge saved config
        if (data.config) {
            Object.assign(config, data.config);

            // Ensure channelNames is an array (migrate from legacy format)
            if (!Array.isArray(config.channelNames)) {
                config.channelNames = Array(8).fill('').map((_, i) =>
                    data.config[`channelName${i + 1}`] || ''
                );
            }
        }

        // Legacy support - check for old format
        if (data.deviceIP) config.deviceIP = data.deviceIP;
        if (data.time !== undefined) config.time = data.time;
        if (data.wifiName) config.wifiName = data.wifiName;
        if (data.wifiPassword) config.wifiPassword = data.wifiPassword;

        // Get schedules
        const schedules = data.schedules || [];

        return { config, schedules };
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return {
            config: {
                deviceIP: '',
                time: false,
                wifiName: '',
                wifiPassword: '',
                channelNames: Array(8).fill('')
            },
            schedules: []
        };
    }
}

/**
 * Save language preference
 * @param {string} lang - Language code (en/pl)
 */
export function saveLanguage(lang) {
    try {
        localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
        console.error('Failed to save language:', error);
    }
}

/**
 * Load language preference
 * @returns {string} Language code (defaults to 'en')
 */
export function loadLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || 'en';
}

/**
 * Clear all stored data (for reset functionality)
 */
export function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Storage cleared');
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
}

/**
 * Export configuration as JSON string
 * @returns {string} JSON string of current configuration
 */
export function exportConfiguration() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data || '{}';
}

/**
 * Import configuration from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
export function importConfiguration(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to import configuration:', error);
        return false;
    }
}
