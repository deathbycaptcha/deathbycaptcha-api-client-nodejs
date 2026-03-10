/*
* Death by Captcha Node.js API Audio usage example
*/

const fs = require('fs');
const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

// Read the audio file and convert it to base64 string
let base64String = null;
try {
    const fileData = fs.readFileSync('images/audio.mp3');
    base64String = fileData.toString('base64');
  } catch (error) {
    console.error('An error occurred while reading the file:', error);
  }

// Death By Captcha Socket Client
// const client = new dbc.SocketClient(username, password);
// Death By Captcha http Client
const client = new dbc.SocketClient(username, password);

// To use token authentication the first parameter must be "authtoken"
// const client = new dbc.HttpClient("authtoken", token_from_panel);

// Get user balance
client.get_balance((balance) => {
    console.log(balance);
});

// Solve captcha with type 13 & audio base64 string & language
client.decode({extra: {type: 13, audio: base64String, language: "en"}}, (captcha) => {

    if (captcha) {
        console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);

        /*
        * Report an incorrectly solved CAPTCHA.
        * Make sure the CAPTCHA was in fact incorrectly solved!
        * client.report(captcha['captcha'], (result) => {
        *   console.log('Report status: ' + result);
        * });
        */
    }

});
