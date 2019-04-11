const cheerio = require('cheerio');
const phantom = require('phantom');
const okrabyte = require('okrabyte');
const path = require('path');
const fs = require('fs');
const accountSid = '';
const authToken = '';
const client = require('twilio')(accountSid, authToken);

let lockerLocation = '';
let previousLockerLocation = [];
let lockerNames = '';
let lockerNamesArray = [];
let textData = '';
let location = '';
// delayStart();
// function delayStart() {
//     console.log('Delay Started......');
//     setTimeout(() => {
//         console.log('Checking for new Tweet...');
//         monitor();
//     }, 6000000)

// }


// Monitoring
function monitor() {
    console.log('Amazon Santas Locker Bot - Loading....');
    setTimeout(() => {
        console.log('Checking for new Tweet...');
        twitterCheck();
    }, 20000)
}
monitor();
// Twitter

async function twitterCheck() {
    console.log('Taking Screenshot...');
    const tInstance = await phantom.create();
    const tpage = await tInstance.createPage();

    tpage.property('clipRect', {
        top: 679,
        left: 440,
        width: 440,
        height: 350
    }).then(

    );

    await tpage.open('https://twitter.com/AmazonUK');
    await tpage.render('twitterScreenshot' + '.png');
    await tInstance.exit();
    imageOCR();
}

function imageOCR() {
    console.log('Decoding Image...');
    okrabyte.decodeFile('twitterScreenshot.png', (error, data) => {
        if (error) {
            console.log(error);
        }
        let dataArray = data.split(' ');

        // for (let i = 0; i <= dataArray.length; i++) {
        //     console.log(dataArray[i]);
        // }


        console.log('Filtering location....');

        lockerLocation = [...dataArray].pop();
        console.log('Locker Location is: ', lockerLocation);
        location = lockerLocation;
        previousLockerLocation.push(lockerLocation);

    });
    scrape();
}

async function scrape() {
    const instance = await phantom.create();
    const page = await instance.createPage();
    console.log('Scraping Google Maps Client Search....');
    const status = await page.open(`https://www.google.co.uk/maps/search/amazon+locker+in+${location}`);
    const content = await page.property('content');
    scrapeContent(content);
    await instance.exit();
};

// Scrape content
function scrapeContent(content) {
    const $ = cheerio.load(content);

    $('.section-result-title span').each((i, locker) => {
        lockerNames = $(locker).text();
        console.log(lockerNames);
        lockerNamesArray.push(lockerNames);
    });

    textData = lockerNamesArray.join('\r\n');

    let lockerLength = previousLockerLocation.length;

    if (previousLockerLocation[lockerLength - 2] != lockerLocation) {
        monitor();
    } else {
        console.log('No new tweet found...', previousLockerLocation);
    }
    monitor();
}

// Notifcation
function sendText(body) {
    client.messages
        .create({
            from: '+441277420219 	',
            body: body,
            to: '+447468450924'
        })
        .then(message => console.log('Text Sent! SID: ', message.sid))
        .done();
}
