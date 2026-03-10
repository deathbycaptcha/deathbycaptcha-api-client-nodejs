/*
* Death by Captcha Node.js API geetest usage example
*/

const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

// Proxy and geetest token data
const geetest_params = JSON.stringify({
    'proxy': 'http://username:password@proxy.example:3128',
    'proxytype': 'HTTP',
    'captcha_id': 'fcd636b4514bf7ac4143922550b3008b',
    'pageurl': 'https://www.geetest.com/en/adaptive-captcha-demo'
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

// Solve captcha with type 9 & token_params extra arguments
client.decode({extra: {type: 9, geetest_params: geetest_params}}, (captcha) => {

    if (captcha) {
        console.log('Captcha ' + captcha['captcha'] + ' solved: ' + JSON.stringify(captcha['text']));

        // // To access the response by item
        // console.log('captcha_id:' + captcha['text']['captcha_id'])
        // console.log('lot_number:' + captcha['text']['lot_number'])
        // console.log('pass_token:' + captcha['text']['pass_token'])
        // console.log('gen_time:' + captcha['text']['gen_time'])
        // console.log('captcha_output:' + captcha['text']['captcha_output'])

        /*
        * Report an incorrectly solved CAPTCHA.
        * Make sure the CAPTCHA was in fact incorrectly solved!
        * client.report(captcha['captcha'], (result) => {
        *   console.log('Report status: ' + result);
        * });
        */
    }

});
