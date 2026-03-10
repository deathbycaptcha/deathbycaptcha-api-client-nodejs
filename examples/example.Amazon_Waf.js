/*
* Death by Captcha Node.js API Amazon Waf usage example
*/

const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

// Proxy and Amazon WAF data
const waf_params = JSON.stringify({
    'proxy': 'http://username:password@proxy.example:3128',
    'proxytype': 'HTTP',
    'sitekey': 'AQIDAHjcYu/GjX+QlghicBgQ/7bFaQZ+m5FKCMDnO+vTbNg96AHDh0IR5vgzHNceHYqZR+GOAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMsYNQbVOLOfd/1ofjAgEQgDuhVKc2V/0XTEPc+9X/xAodxDqgyNNNyYJN1rM2gs4yBMeDXXc3z2ZxmD9jsQ8eNMGHqeii56iL2Guh4A==',
    'pageurl': 'https://efw47fpad9.execute-api.us-east-1.amazonaws.com/latest',
    'iv': 'CgAFRjIw2vAAABSM',
    'context': 'zPT0jOl1rQlUNaldX6LUpn4D6Tl9bJ8VUQ/NrWFxPiiFujn5bFHzpOlKYQG0Di/UrO/p0xItkf7oGrknHqnj+UjvWv+i0BFbm3vGKceNaGtjrg4wvydL2Li5XjwRUOMW4o+NgO3JPJhkgwRKSyK62cIIzrThlOBD+gmtvKW0JNtH8efKR8Y5mBf0gi8JokjUxq/XbyB6h83tfaiWrp3dkOJsEXHLkT/wwQlFZysA919LCA+XVqgJ9lurUZqHWar+9JHqWnc0ghckKCnUzubvSQzJl+eSIAIoYZrpuZQszOwWzo4=',
    //'challengejs': '', // optional parameter
    //'captchajs': ''    // optional parameter
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

// Solve captcha with type 16 & waf_params extra arguments
client.decode({extra: {type: 16, waf_params: waf_params}}, (captcha) => {

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
