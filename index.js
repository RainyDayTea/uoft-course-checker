require('dotenv').config(); // Set up environment vars

const axios = require('axios');
const fs = require('fs');
const assert = require('assert/strict');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { requestIntervalMs, 
    targetChannel, 
    request, 
    retryAfterFailure
} = JSON.parse(fs.readFileSync('./config.json'));
const courseSection = request.courseSection;

let availability = 0;
const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
]});

// ----------- INIT ----------- //



client.once(Events.ClientReady, client => {
    console.log(`Ready! Signed in as ${client.user.tag}`);
    console.log(`Course code: ${request.courseCodeAndTitleProps.courseCode}`);
    setTimeout(getAvailability, requestIntervalMs);
});

if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', 'DISCORD_TOKEN=(your token here)');
    throw new Error('No .env file detected. Please go to your .env file and enter the bot\'s token.');
}
client.login(process.env.DISCORD_TOKEN)
.then(() => {
    console.log(`Succesfully logged in to Discord.`);
})
.catch(err => {
    console.error(`${err}`);
});

// ----------- FUNCTIONS ----------- //

function getDatetimeNow() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${day}/${month} ${hours}:${minutes}:${seconds}`;
}

async function getAvailability() {
    try {
        console.log(`[${getDatetimeNow()}] Querying timetable...`);
        let {data} = await axios.post('https://api.easi.utoronto.ca/ttb/getPageableCourses', request, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        assert(data.payload.pageableCourse.total == 1);
        let sections = data.payload.pageableCourse.courses[0].sections;
        for (const sec of sections) {
            if (sec.name == courseSection) {
                // assert(typeof sec.maxEnrolment == 'number');
                // assert(typeof sec.currentEnrolment == 'number');
                let newAvailability = sec.maxEnrolment - sec.currentEnrolment;
                if (availability < 1) {
                    console.log(`[${getDatetimeNow()}] Initial capacity (${sec.currentEnrolment} / ${sec.maxEnrolment})`);
                } else if (newAvailability - availability != 0) {
                    console.log(`[${getDatetimeNow()}] Update detected (${sec.currentEnrolment} / ${sec.maxEnrolment})`);
                }
                if (newAvailability - availability > 0 && availability > 0) {
                    await client.users.send(targetChannel, `Spot opened for ${request.courseCodeAndTitleProps.courseCode}!`);
                } else if (newAvailability - availability < 0) {
                    await client.users.send(targetChannel, `Spot taken for ${request.courseCodeAndTitleProps.courseCode}!`);
                }
                availability = newAvailability;
            }
        }
        if (!retryAfterFailure) setTimeout(getAvailability, requestIntervalMs);
    } catch (err) {
        console.error(`${err}`);
    }
    if (retryAfterFailure) setTimeout(getAvailability, requestIntervalMs);
}
