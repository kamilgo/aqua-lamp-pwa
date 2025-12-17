/**
 * Main Application Module
 * Contains the Alpine.js application logic
 */

import { translations } from './translations.js';
import * as API from './api.js';
import * as Storage from './storage.js';

/**
 * Alpine.js App Data
 * This function is called by Alpine.js to initialize the application state
 */
window.appData = function() {
    return {
        // ==================== STATE ====================
        activeTab: 'control',
        currentLang: 'en',
        connectionStatus: 'unknown', // unknown, connected, disconnected

        // ==================== CONFIGURATION ====================
        config: {
            deviceIP: '',
            time: false,
            wifiName: '',
            wifiPassword: '',
            channelNames: Array(8).fill('')
        },

        // ==================== CHANNELS ====================
        channels: Array(8).fill(null).map(() => ({
            enabled: false,
            pwm: 50
        })),

        // ==================== SCHEDULES ====================
        schedules: [],

        // ==================== STATUS ====================
        status: {
            show: false,
            type: 'success', // success or error
            message: ''
        },

        // ==================== TRANSLATIONS ====================
        translations: translations,

        // ==================== INITIALIZATION ====================

        /**
         * Initialize the application
         * Called automatically by Alpine.js
         */
        init() {
            this.loadFromLocalStorage();
            this.currentLang = Storage.loadLanguage();
            console.log('App initialized');
        },

        // ==================== TRANSLATION HELPERS ====================

        /**
         * Get translation for a key
         * @param {string} key - Translation key
         * @returns {string} Translated string
         */
        t(key) {
            return this.translations[this.currentLang]?.[key] || key;
        },

        /**
         * Toggle language between English and Polish
         */
        toggleLanguage() {
            this.currentLang = this.currentLang === 'en' ? 'pl' : 'en';
            Storage.saveLanguage(this.currentLang);
        },

        // ==================== CHANNEL HELPERS ====================

        /**
         * Get channel name (with fallback to default)
         * @param {number} channelNum - Channel number (1-8)
         * @returns {string} Channel name
         */
        getChannelName(channelNum) {
            const name = this.config.channelNames[channelNum - 1];
            return name || `${this.t('Channel')} ${channelNum}`;
        },

        // ==================== API OPERATIONS ====================

        /**
         * Check device connection
         */
        async checkConnection() {
            if (!this.config.deviceIP) {
                this.showStatus('error', this.t('Device IP not set'));
                return;
            }

            try {
                await API.checkConnection(this.config.deviceIP);
                this.connectionStatus = 'connected';
                this.showStatus('success', this.t('Connected successfully'));
            } catch (error) {
                this.connectionStatus = 'disconnected';
                this.showStatus('error', this.t('Connection failed'));
                console.error('Connection error:', error);
            }
        },

        /**
         * Toggle channel manual mode
         * @param {number} channelNum - Channel number (1-8)
         */
        async toggleChannel(channelNum) {
            const channel = this.channels[channelNum - 1];

            try {
                const result = await API.toggleChannelManualMode(
                    this.config.deviceIP,
                    channelNum,
                    channel.enabled
                );

                if (channel.enabled && result.pwm_ratio !== undefined) {
                    channel.pwm = result.pwm_ratio;
                }
            } catch (error) {
                this.showStatus('error', `${this.t('Error updating channel')}: ${error.message}`);
                channel.enabled = !channel.enabled; // Revert on error
                console.error('Toggle channel error:', error);
            }
        },

        /**
         * Update PWM value for a channel
         * @param {number} channelNum - Channel number (1-8)
         * @param {number} value - PWM value (0-100)
         */
        async updatePWM(channelNum, value) {
            try {
                await API.updateChannelPWM(this.config.deviceIP, channelNum, value);
            } catch (error) {
                this.showStatus('error', `${this.t('Error updating channel')}: ${error.message}`);
                console.error('Update PWM error:', error);
            }
        },

        /**
         * Disable all channels
         */
        async disableAllChannels() {
            for (let i = 0; i < 8; i++) {
                if (this.channels[i].enabled) {
                    this.channels[i].enabled = false;
                    await this.toggleChannel(i + 1);
                }
            }
            this.showStatus('success', this.t('All channels disabled'));
        },

        // ==================== SCHEDULE OPERATIONS ====================

        /**
         * Add new schedule
         */
        addSchedule() {
            const schedule = {
                id: Date.now(),
                days: [],
                startHour: 8,
                startMinute: 0,
                endHour: 20,
                endMinute: 0,
                startDuty: 0,
                maxDuty: 100,
                endDuty: 0,
                startInterval: 60,
                endInterval: 60,
                channels: []
            };
            this.schedules.push(schedule);
            this.saveToLocalStorage();
        },

        /**
         * Remove schedule
         * @param {number} scheduleId - Schedule ID
         */
        removeSchedule(scheduleId) {
            this.schedules = this.schedules.filter(s => s.id !== scheduleId);
            this.saveToLocalStorage();
        },

        /**
         * Toggle day selection in schedule
         * @param {number} scheduleId - Schedule ID
         * @param {number} dayNum - Day number (1-7)
         */
        toggleScheduleDay(scheduleId, dayNum) {
            const schedule = this.schedules.find(s => s.id === scheduleId);
            if (!schedule) return;

            const index = schedule.days.indexOf(dayNum);
            if (index > -1) {
                schedule.days.splice(index, 1);
            } else {
                schedule.days.push(dayNum);
            }
            this.saveToLocalStorage();
        },

        /**
         * Toggle channel selection in schedule
         * @param {number} scheduleId - Schedule ID
         * @param {number} channelNum - Channel number (1-8)
         */
        toggleScheduleChannel(scheduleId, channelNum) {
            const schedule = this.schedules.find(s => s.id === scheduleId);
            if (!schedule) return;

            const index = schedule.channels.indexOf(channelNum);
            if (index > -1) {
                schedule.channels.splice(index, 1);
            } else {
                schedule.channels.push(channelNum);
            }
            this.saveToLocalStorage();
        },

        // ==================== STORAGE OPERATIONS ====================

        /**
         * Save configuration to localStorage
         */
        saveToLocalStorage() {
            Storage.saveToLocalStorage(this.config, this.schedules);
        },

        /**
         * Load configuration from localStorage
         */
        loadFromLocalStorage() {
            const { config, schedules } = Storage.loadFromLocalStorage();
            this.config = config;
            this.schedules = schedules;
        },

        /**
         * Save configuration to device
         */
        async saveConfiguration() {
            if (!this.config.deviceIP) {
                this.showStatus('error', this.t('Device IP not set'));
                return;
            }

            try {
                await API.saveConfigurationToDevice(
                    this.config.deviceIP,
                    this.config,
                    this.schedules
                );
                this.showStatus('success', this.t('Configuration saved successfully!'));
            } catch (error) {
                this.showStatus('error', this.t('Error saving configuration. Data saved locally.'));
                console.error('Save configuration error:', error);
            }

            // Always save to localStorage
            this.saveToLocalStorage();
        },

        // ==================== UI HELPERS ====================

        /**
         * Show status message
         * @param {string} type - Message type (success/error)
         * @param {string} message - Message text
         */
        showStatus(type, message) {
            this.status = { show: true, type, message };
            setTimeout(() => {
                this.status.show = false;
            }, 5000);
        }
    };
};
