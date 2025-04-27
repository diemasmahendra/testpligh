# TestFlight Availability Monitor

A Node.js utility that monitors a TestFlight beta link and sends notifications to Telegram when slots become available.

## Features

- Periodically checks if a TestFlight beta has available slots
- Sends notifications via Telegram when slots open up
- Configurable check intervals and retry strategies
- Detailed logging for monitoring activity

## Requirements

- Node.js 14.x or higher
- A Telegram bot token (create one via [@BotFather](https://t.me/botfather))
- Your Telegram chat ID (you can get this from [@userinfobot](https://t.me/userinfobot))

## Setup

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file and add your Telegram bot token and chat ID

## Configuration

Edit the `.env` file to configure the following:

```
# TestFlight Configuration
TESTFLIGHT_URL=https://testflight.apple.com/join/72eyUWVE,https://testflight.apple.com/join/gdE4pRzI
CHECK_INTERVAL_MINUTES=5
MAX_RETRIES=3
RETRY_DELAY_SECONDS=30

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## Usage

Start the monitor:

```
npm start
```

The script will run continuously, checking the TestFlight link at the specified interval and sending notifications to your Telegram when slots become available.

## How It Works

1. The script periodically checks the TestFlight link by sending HTTP requests
2. It parses the HTML response to determine if the beta is full or has available slots
3. When slots become available, it sends a notification to your Telegram
4. If errors occur, it implements a retry strategy with exponential backoff

## Notes

- To avoid notification spam, the script only sends one notification per hour when slots are available
- The script includes error handling and will notify you if it encounters persistent issues

## License

MIT
