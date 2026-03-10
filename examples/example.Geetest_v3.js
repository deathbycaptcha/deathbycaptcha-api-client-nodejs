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
    'gt': '022397c99c9f646f6477822485f30404',
    'challenge': '7bb6d65c31c09f1aec5fe08d08ce44f7',
    'pageurl': 'https://www.geetest.com/en/demo'
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
client.decode({extra: {type: 8, geetest_params: geetest_params}}, (captcha) => {

    if (captcha) {
        console.log('Captcha ' + captcha['captcha'] + ' solved: ' + JSON.stringify(captcha['text']));

        // // To access the response by item
        // console.log('challenge:', captcha['text']['challenge'])
        // console.log('validate:', captcha['text']['validate'])
        // console.log('seccode:', captcha['text']['seccode'])

        /*
        * Report an incorrectly solved CAPTCHA.
        * Make sure the CAPTCHA was in fact incorrectly solved!
        * client.report(captcha['captcha'], (result) => {
        *   console.log('Report status: ' + result);
        * });
        */
    }

});
