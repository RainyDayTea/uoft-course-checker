# UofT Course Checker


A minimal, hastily-written Discord app to notify the user when a course spot becomes open.

## Requirements
- Node.js (recommended latest stable version)
- A Discord bot token. If you've never registered an app on Discord before, follow [this guide](https://discord.com/developers/docs/getting-started).


## Installation/Running

1. Clone this repository into your desired directory.
2. Within the app root directory, run `npm install` to install dependencies.
3. In the same directory, add a `.env` file with the following field:
```env
DISCORD_TOKEN=(your token here)
```
4. In the terminal, `cd` to the project directory and run the app with `node index.js`
5. To run silently in the background, use `node index.js > /dev/null 2>&1 &` . Note that you'll need to kill the program manually later.


## Configuration

All config options are located within `config.json`.
- `targetChannel`: The ID of the Discord channel the bot will message to.
- `requestIntervalMs`: The time in milliseconds between POST requests made to the UofT timetable API.
- `retryAfterFailure`: If true, the app will keep trying to make requests to the timetable after an error occurs.
- `requestOptions`: Contains various parameters for selecting a specific course. May require some experimentation.