/*
* Death by Captcha Node.js API atb usage example
*/

const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

const atb_params = JSON.stringify({
    'proxy': 'http://username:password@proxy.example:3128',
    'proxytype': 'HTTP',
    'appid': 'af23e041b22d000a11e22a230fa8991c',
    'pageurl': 'https://www.example.com/',
    'apiserver': 'https://cap.aisecurius.com'
});

// Death By Captcha Socket Client
// const client = new dbc.SocketClient(username, password);
// Death By Captcha http Client
const client = new dbc.HttpClient(username, password);

// To use token authentication the first parameter must be "authtoken"
// const client = new dbc.HttpClient("authtoken", token_from_panel);

// Get user balance
client.get_balance((balance) => {
    console.log(balance);
});

// Solve captcha with type 24 & atb_params extra arguments
client.decode({extra: {type: 24, atb_params: atb_params}}, (captcha) => {

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
