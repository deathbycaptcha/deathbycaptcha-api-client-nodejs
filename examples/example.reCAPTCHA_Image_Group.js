/*
* Death by Captcha Node.js API newrecaptcha_image_groups usage example
*/

const dbc = require('deathbycaptcha-lib');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const token_from_panel = 'your-token-from-panel';   // DBC account authtoken

const captcha_file = '../images/test2.jpg';           // Captcha image filename src
const banner = '../images/banner.jpg';                // Banner image filename src
const banner_text = 'select all pizza:';    // Banner text

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

// Solve captcha with type 3, banner & banner_text extra arguments
client.decode({captcha: captcha_file, extra: {type: 3, banner: banner, banner_text: banner_text}}, (captcha) => {

    // you can supply optional `grid` argument to decode() call, with a
    // string like 3x3 or 2x4, defining what grid individual images were located at
    // example:
    // captcha = client.decode({captcha: captcha_file, extra: {type: 3, banner: banner, banner_text: banner_text, grid: "2x4"}, (captcha) => {
    //   ...
    // });
    // see 2x4.png example image to have an idea what that images look like
    // If you wont supply `grid` argument, dbc will attempt to autodetect the grid

    if (captcha) {
        console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);

        // Report an incorrectly solved CAPTCHA.
        // Make sure the CAPTCHA was in fact incorrectly solved!
        // client.report(captcha['captcha'], (result) => {
        //   console.log('Report status: ' + result);
        // });
    }

});
