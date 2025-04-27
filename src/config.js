/**
 * Configuration settings for the TestFlight Monitor
 */

// Default configuration
const config = {
  // TestFlight settings
  testflightUrls: (process.env.TESTFLIGHT_URLS || 'https://testflight.apple.com/join/72eyUWVE').split(',').map(url => url.trim()),
  checkIntervalSeconds: parseInt(process.env.CHECK_INTERVAL_SECONDS, 10) || 10,
  maxRetries: parseInt(process.env.MAX_RETRIES, 10) || 3,
  retryDelaySeconds: parseInt(process.env.RETRY_DELAY_SECONDS, 10) || 30,
  
  // Telegram settings
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  
  // User agent to mimic a browser
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
};

// Validate critical configuration
function validateConfig() {
  const requiredKeys = ['testflightUrls', 'telegramBotToken', 'telegramChatId'];
  const missingKeys = requiredKeys.filter(key => !config[key] || 
    (Array.isArray(config[key]) && config[key].length === 0));
  
  if (missingKeys.length > 0) {
    console.warn(`⚠️  Warning: Missing configuration: ${missingKeys.join(', ')}`);
    
    if (missingKeys.includes('telegramBotToken') || missingKeys.includes('telegramChatId')) {
      console.warn('Telegram notifications will not work without proper configuration.');
      console.warn('Please create a .env file based on .env.example and fill in the required values.');
    }
  }
}

// Run validation on startup
validateConfig();

module.exports = config;