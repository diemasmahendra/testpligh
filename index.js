/**
 * TestFlight Availability Monitor
 * Monitors multiple TestFlight links and sends Telegram notifications when slots are available
 */

// Load environment variables
require('dotenv').config();

// Import modules
const { checkTestFlightAvailability } = require('./src/testflightMonitor');
const { sendTelegramMessage } = require('./src/telegramNotifier');
const { logger } = require('./src/utils/logger');
const config = require('./src/config');

// Track errors for each URL
const urlStates = new Map(
  config.testflightUrls.map(url => [url, {
    consecutiveErrors: 0
  }])
);

/**
 * Monitor a single TestFlight URL
 * @param {string} url - The TestFlight URL to monitor
 */
async function monitorSingleTestFlight(url) {
  const state = urlStates.get(url);
  
  try {
    logger.info(`Checking TestFlight availability: ${url}`);
    
    const result = await checkTestFlightAvailability(url);
    
    if (result.isAvailable) {
      logger.info(`✅ TestFlight is AVAILABLE for ${result.appName || 'Unknown App'}!`);
      
      // Send notification every time slots are available
      await sendTelegramMessage(
        `🎉 TestFlight is now AVAILABLE! 🎉\n\nApp: ${result.appName || 'Unknown App'}\n\nGet it now: ${url}`
      );
      logger.info(`Notification sent to Telegram for ${result.appName || url}`);
      
      state.consecutiveErrors = 0;
    } else {
      logger.info(`❌ TestFlight is FULL for ${result.appName || 'Unknown App'}`);
      state.consecutiveErrors = 0;
    }
  } catch (error) {
    state.consecutiveErrors++;
    logger.error(`Error checking TestFlight for ${url} (attempt ${state.consecutiveErrors}): ${error.message}`);
    
    // If we have consecutive errors but less than max retries, try again sooner
    if (state.consecutiveErrors < config.maxRetries) {
      logger.info(`Retrying ${url} in ${config.retryDelaySeconds} seconds...`);
      setTimeout(() => monitorSingleTestFlight(url), config.retryDelaySeconds * 1000);
      return;
    }
    
    // After max retries, notify about the issue
    if (state.consecutiveErrors === config.maxRetries) {
      try {
        await sendTelegramMessage(
          `⚠️ Warning: Having trouble checking TestFlight availability.\nURL: ${url}\nError: ${error.message}\n\nWill continue monitoring, but you may want to check manually.`
        );
        logger.info(`Error notification sent to Telegram for ${url}`);
      } catch (notifyError) {
        logger.error(`Failed to send error notification for ${url}: ${notifyError.message}`);
      }
    }
  }
}

/**
 * Main monitoring function for all TestFlight URLs
 */
async function monitorAllTestFlights() {
  // Monitor each URL in parallel
  await Promise.all(config.testflightUrls.map(url => monitorSingleTestFlight(url)));
  
  // Schedule next check
  const nextCheckMs = config.checkIntervalSeconds * 1000;
  logger.info(`Next check scheduled in ${config.checkIntervalSeconds} seconds`);
  setTimeout(monitorAllTestFlights, nextCheckMs);
}

// Display startup message
console.log('\n=================================================');
console.log(' 🚀 TestFlight Availability Monitor Started 🚀');
console.log('=================================================');
console.log('📱 Monitoring the following TestFlight URLs:');
config.testflightUrls.forEach(url => console.log(`   ${url}`));
console.log(`⏱️  Check interval: ${config.checkIntervalSeconds} seconds`);
console.log(`🔔 Notifications: Telegram (notifications sent on every available slot)`);
console.log('=================================================\n');

// Start monitoring
monitorAllTestFlights();