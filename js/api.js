/**
 * API Module
 * Handles all communication with the Raspberry Pi Pico device
 */

/**
 * Build device URL from IP address
 * @param {string} deviceIP - Device IP address
 * @returns {string} Full URL
 */
function getDeviceURL(deviceIP) {
    return `http://${deviceIP}`;
}

/**
 * Check device connection (ping/pong)
 * @param {string} deviceIP - Device IP address
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function checkConnection(deviceIP) {
    if (!deviceIP) {
        throw new Error('Device IP not provided');
    }

    try {
        const response = await fetch(`${getDeviceURL(deviceIP)}/ping`, {
            signal: AbortSignal.timeout(5000),
            mode: 'cors',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && data.message === 'pong') {
            return { success: true };
        } else {
            throw new Error('Invalid response from device');
        }
    } catch (error) {
        throw new Error(`Connection failed: ${error.message}`);
    }
}

/**
 * Enable or disable manual control for a channel
 * @param {string} deviceIP - Device IP address
 * @param {number} channelNum - Channel number (1-8)
 * @param {boolean} enabled - Enable or disable
 * @returns {Promise<{success: boolean, pwm_ratio?: number}>}
 */
export async function toggleChannelManualMode(deviceIP, channelNum, enabled) {
    if (!deviceIP) {
        throw new Error('Device IP not provided');
    }

    const endpoint = enabled ? 'on' : 'off';

    try {
        const response = await fetch(
            `${getDeviceURL(deviceIP)}/channels/${channelNum}/manual/${endpoint}`,
            {
                mode: 'cors',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                pwm_ratio: data.pwm_ratio
            };
        } else {
            throw new Error(data.message || 'Failed to toggle channel');
        }
    } catch (error) {
        throw new Error(`Failed to toggle channel: ${error.message}`);
    }
}

/**
 * Update PWM value for a channel
 * @param {string} deviceIP - Device IP address
 * @param {number} channelNum - Channel number (1-8)
 * @param {number} value - PWM value (0-100)
 * @returns {Promise<{success: boolean}>}
 */
export async function updateChannelPWM(deviceIP, channelNum, value) {
    if (!deviceIP) {
        throw new Error('Device IP not provided');
    }

    try {
        const response = await fetch(
            `${getDeviceURL(deviceIP)}/channels/${channelNum}/pwm/${value}`,
            {
                mode: 'cors',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = await response.json();

        if (data.status === 'success') {
            return { success: true };
        } else {
            throw new Error(data.message || 'Failed to update PWM');
        }
    } catch (error) {
        throw new Error(`Failed to update PWM: ${error.message}`);
    }
}

/**
 * Save full configuration to device
 * @param {string} deviceIP - Device IP address
 * @param {Object} config - Configuration object
 * @param {Array} schedules - Schedules array
 * @returns {Promise<{success: boolean}>}
 */
export async function saveConfigurationToDevice(deviceIP, config, schedules) {
    if (!deviceIP) {
        throw new Error('Device IP not provided');
    }

    // Calculate timezone offset in minutes (negated because getTimezoneOffset returns inverse)
    const timezoneOffset = -new Date().getTimezoneOffset();

    // Build payload
    const payload = {
        time: config.time ? parseInt(Date.now().toString().substr(0, 10)) : 0,
        timezone_offset: timezoneOffset,
        wifiName: config.wifiName || '',
        wifiPassword: config.wifiPassword || ''
    };

    if(schedules !== null) {
        payload.schedules = schedules || [];
    }

    try {
        const response = await fetch(`${getDeviceURL(deviceIP)}/store`, {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return { success: true };
        } else {
            throw new Error('Failed to save configuration to device');
        }
    } catch (error) {
        throw new Error(`Failed to save configuration: ${error.message}`);
    }
}
