/**
 * Telegram notification service
 * Sends messages to a Telegram chat via a bot
 */

const axios = require('axios');
const config = require('./config');
const { logger } = require('./utils/logger');

/**
 * Send a message to Telegram
 * @param {string} message - The message to send
 * @returns {Promise<void>}
 */
async function sendTelegramMessage(message) {
  // Check if Telegram configuration is available
  if (!config.telegramBotToken || !config.telegramChatId) {
    logger.error('Telegram configuration is missing. Cannot send notification.');
    throw new Error('Telegram configuration is missing. Please check your .env file.');
  }

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    
    const response = await axios.post(telegramApiUrl, {
      chat_id: config.telegramChatId,
      text: message,
      parse_mode: 'Markdown'
    });

    if (response.status === 200 && response.data.ok) {
      logger.debug('Telegram notification sent successfully');
      return true;
    } else {
      throw new Error(`Telegram API returned error: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    logger.error(`Failed to send Telegram notification: ${error.message}`);
    throw new Error(`Failed to send Telegram notification: ${error.message}`);
  }
}

module.exports = {
  sendTelegramMessage
};