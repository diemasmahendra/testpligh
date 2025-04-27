/**
 * TestFlight availability checker
 * Parses the TestFlight page to determine if it's full or has available slots
 */

const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config');
const { logger } = require('./utils/logger');

/**
 * Check if a TestFlight beta is available
 * @param {string} url - The TestFlight URL to check
 * @returns {Promise<{isAvailable: boolean, appName: string, message: string}>}
 */
async function checkTestFlightAvailability(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000 // 10 second timeout
    });

    // Parse the HTML response
    const $ = cheerio.load(response.data);
    
    // Get the app name using multiple selectors
    let appName = '';
    
    // Try different selectors where app name might be found
    const selectors = [
      '.app-header__title',                    // Main app title
      'h1.beta-status__app-title',             // Beta status title
      '.beta-status__app-name',                // App name in beta status
      'h1:contains("Join the beta")',          // Join beta heading
      '.beta-status__title:contains("beta")',  // Beta status title
      'title'                                  // Page title
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        appName = element.text().trim();
        // Clean up the app name
        appName = appName
          .replace('Join the beta -', '')
          .replace('Beta -', '')
          .replace('TestFlight -', '')
          .replace('- TestFlight', '')
          .replace('Beta', '')
          .trim();
        
        if (appName) break;
      }
    }
    
    // If still no app name found, try to find any prominent heading
    if (!appName) {
      $('h1, h2').each((i, el) => {
        const text = $(el).text().trim();
        if (text && !text.toLowerCase().includes('testflight') && !text.toLowerCase().includes('beta')) {
          appName = text;
          return false; // break the loop
        }
      });
    }
    
    // Check for indicators that the beta is full
    const betaFullText = $('body').text();
    const isFull = betaFullText.includes('This beta is full') || 
                  betaFullText.includes('Beta program is currently full') ||
                  betaFullText.includes('No longer accepting new testers');
    
    // Check for specific button or availability indicator
    const joinButton = $('button:contains("Join the Beta")').length > 0 ||
                      $('button:contains("Start Testing")').length > 0;
    
    // If we have a join button or no "full" text, consider it available
    const isAvailable = joinButton || !isFull;
    
    let message = '';
    if (isAvailable) {
      message = `TestFlight for ${appName || 'the app'} has available slots!`;
    } else {
      message = `TestFlight for ${appName || 'the app'} is currently full.`;
    }
    
    logger.debug(`Status: ${isAvailable ? 'Available' : 'Full'}, App: ${appName || 'Unknown'}`);
    
    return {
      isAvailable,
      appName: appName || 'Unknown App',
      message
    };
  } catch (error) {
    logger.error(`Error checking TestFlight availability: ${error.message}`);
    throw new Error(`Failed to check TestFlight availability: ${error.message}`);
  }
}

module.exports = {
  checkTestFlightAvailability
};