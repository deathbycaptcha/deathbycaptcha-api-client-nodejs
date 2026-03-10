/*
* Death by Captcha Node.js API recaptcha_v3 token image usage example
*/

const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

// Proxy and recaptcha_v3 token data
// recaptcha_v3 requires 'action' that is the action that triggers
// recaptcha_v3 validation
// if 'action' isn't provided we use the default value "verify"
// also you need to provide 'min_score', a number from 0.1 to 0.9,
// this is the minimum score acceptable from recaptchaV3
const token_params = JSON.stringify({
    'proxy': 'http://username:password@proxy.example:3128',
    'proxytype': 'HTTP',
    'googlekey': '6Lc2fhwTAAAAAGatXTzFYfvlQMI2T7B6ji8UVV_f',
    'pageurl': 'http://google.com',
    'action': "example/action",
    'min_score': 0.3
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

// Solve captcha with type 5 & token_params extra arguments
client.decode({extra: {type: 5, token_params: token_params}}, (captcha) => {

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
