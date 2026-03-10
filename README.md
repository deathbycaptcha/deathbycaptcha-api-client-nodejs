# [DeathByCaptcha](https://deathbycaptcha.com/)

[![Unit Tests Node 24](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://deathbycaptcha.github.io/deathbycaptcha-api-client-nodejs/coverage-badge.json)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/coverage.yml)


## Introduction

DeathByCaptcha offers APIs of two types — HTTP and socket-based, with the latter being recommended for having faster responses and overall better performance. Switching between different APIs is usually as easy as changing the client class and/or package name, the interface stays the same.

When using the socket API, please make sure that outgoing TCP traffic to *api.dbcapi.me* to the ports range *8123–8130* is not blocked on your side.

## Index

- [Introduction](#introduction) — overview and API transport options.
- [Installation](#installation)
    - [From npm](#from-npm)
    - [From GitHub repo](#from-github-repo)
- [How to Use DBC API Clients](#how-to-use-dbc-api-clients)
    - [Common Clients' Interface](#common-clients-interface)
        - [Upload()](#upload)
        - [GetCaptcha()](#getcaptcha)
        - [Report()](#report)
        - [Decode()](#decode)
        - [GetBalance()](#getbalance)
    - [CAPTCHA objects/details hashes](#captcha-objectsdetails-hashes)
    - [Example](#example)
        - [Quick balance sample](examples/get_balance.js)
        - [Selenium sample (reCAPTCHA v2 token)](examples/selenium/recaptcha_v2_selenium.js)
- [Recaptcha API support](#new-recaptcha-api-support)
    - [What's "new reCAPTCHA/noCAPTCHA"?](#whats-new-recaptchano-captcha)
    - [Coordinates API FAQ](#coordinates-api-faq)
    - [Image Group API FAQ](#image-group-api-faq)
- [Recaptcha by Token API support (reCAPTCHA v2 and reCAPTCHA v3)](#new-recaptcha-by-token-api-support-recaptcha-v2-and-recaptcha-v3)
    - [What's "new reCAPTCHA by Token"?](#whats-new-recaptcha-by-token)
    - [reCAPTCHA v2 API FAQ](#recaptcha-v2-api-faq)
    - [What's "new reCAPTCHA v3"?](#whats-new-recaptcha-v3)
    - [reCAPTCHA v3 API FAQ](#recaptcha-v3-api-faq)
- [Selenium Quick Start](examples/selenium/README.md)
    - [Example script](examples/selenium/recaptcha_v2_selenium.js)
    - [Integration test](tests/integration/selenium.integration.test.js)
    - [Env sample](.env.sample)
- [Testing](#testing)
    - [Setup test environment](#setup-test-environment)
    - [Run API basic integration test](#run-api-basic-integration-test)
    - [Run Selenium integration test](#run-selenium-integration-test)
    - [Run full integration suite](#run-full-integration-suite)
- [CI](#ci)
    - [GitLab unit test matrix](#gitlab-unit-test-matrix)
    - [GitHub Actions](#github-actions)

## Installation

### From npm

```bash
npm install deathbycaptcha-lib
```

### From GitHub repo

Install directly from the repository URL:

```bash
npm install git+https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs.git
```

Or clone and install locally:

```bash
git clone https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs.git
cd deathbycaptcha-api-client-nodejs
npm install
```

## How to Use DBC API Clients

### Common Clients' Interface

All clients have to be instantiated with two string arguments: your DeathByCaptcha account's *username* and *password*.

All clients provides a few methods   to handle your CAPTCHAs and your DBC account. Below you will find those methods' short summary and signatures in pseudo-code. Check the example scripts and the clients' source code for more details.

#### Upload()

Uploads a CAPTCHA to the DBC service for solving, returns uploaded CAPTCHA details on success, `NULL` otherwise. Here are the signatures in pseudo-code:

```javascript
dict dbc.Client.upload(file imageFile)

dict dbc.Client.upload(str imageFileName)
```  

#### GetCaptcha()

Fetches uploaded CAPTCHA details, returns `NULL` on failures.

```javascript
dict dbc.Client.get_captcha(dict imageFileName)
```

#### Report()

Reports incorrectly solved CAPTCHA for refund, returns `true` on success, `false` otherwise.

Please make sure the CAPTCHA you're reporting was in fact incorrectly solved, do not just report them thoughtlessly, or else you'll be flagged as abuser and banned.

```javascript
bool dbc.Client.report(int captchaId)
```

#### Decode()

This method uploads a CAPTCHA, then polls for its status until it's solved or times out; returns solved CAPTCHA details on success, `NULL` otherwise.

```javascript
dict dbc.Client.decode(file imageFile, int timeout)

dict dbc.Client.decode(str imageFileName, int timeout)
```

#### GetBalance()

Fetches your current DBC credit balance (in US cents).

```javascript
float dbc.Client.get_balance()
```


### CAPTCHA objects/details hashes

Use simple hashes (dictionaries, associative arrays etc.) to store CAPTCHA details, keeping numeric IDs under "captcha" key, CAPTCHA text under "text" key, and the correctness flag under "is_correct" key.

### Example

Below you can find a DBC API client usage examples.

Quick balance sample:

```bash
node examples/get_balance.js <username> <password> HTTP
```

Selenium internal guide (reCAPTCHA v2 token):

- [examples/selenium/README.md](examples/selenium/README.md)


```javascript
const dbc = require('deathbycaptcha-lib');

// Put your DBC account username and password here.
const username = 'username';     // DBC account username
const password = 'password';     // DBC account password
const captcha_file = 'test.jpg';    // Image filename

// Use dbc.HttpClient for HTTP API.
const client = new dbc.SocketClient(username, password);

const balance = client.get_balance()

// Put your CAPTCHA file name or file-like object, and optional
// solving timeout (in seconds) here:
client.get_balance((balance) => {
    console.log(balance);
});
client.decode({captcha: captcha_file, extra: {type: 2}}, (captcha) => {
    if (captcha) {
        console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);
  
    // Report an incorrectly solved CAPTCHA.
            // Make sure the CAPTCHA was in fact incorrectly solved!
            // client.report(captcha['captcha'], (result) => {
            //   console.log('Report status: ' + result);
            // });
    }
});
```

# New Recaptcha API support

## What's "new reCAPTCHA/noCAPTCHA"?

They're new reCAPTCHA challenges that typically require the user to identify and click on certain images. They're not to be confused with traditional word/number reCAPTCHAs (those have no images).

For your convinience, we implemented support for New Recaptcha API. If your software works with it, and supports minimal configuration, you should be able to decode captchas using New Recaptcha API in no time.

We provide two different types of New Recaptcha API:

-   **Coordinates API**: Provided a screenshot, the API returns a group of coordinates to click.
-   **Image Group API**: Provided a group of (base64-encoded) images, the API returns the indexes of the images to click.

## Coordinates API FAQ:

**What's the Coordinates API URL?**  
To use the **Coordinates API** you will have to send a HTTP POST Request to <http://api.dbcapi.me/api/captcha>

What are the POST parameters for the **Coordinates API**?  

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`captchafile`**: a Base64 encoded or Multipart file contents with a valid New Recaptcha screenshot
-   **`type`=2**: Type 2 specifies this is a New Recaptcha **Coordinates API**

**What's the response from the Coordinates API?**  
-   **`captcha`**: id of the provided captcha, if the **text** field is null, you will have to pool the url <http://api.dbcapi.me/api/captcha/captcha_id> until it becomes available

-   **`is_correct`**: (0 or 1) specifying if the captcha was marked as incorrect or unreadable

-   **`text`**: a json-like nested list, with all the coordinates (x, y) to click relative to the image, for example:

                  [[23.21, 82.11]]
              
    where the X coordinate is 23.21 and the Y coordinate is 82.11

****

## Image Group API FAQ:

**What's the Image Group API URL?**  
To use the **Image Group API** you will have to send a HTTP POST Request to <http://api.dbcapi.me/api/captcha>

**What are the POST parameters for the Image Group API?** 

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`captchafile`**: the Base64 encoded file contents with a valid New Recaptcha screenshot. You must send each image in a single "captchafile" parameter. The order you send them matters
-   **`banner`**: the Base64 encoded banner image (the example image that appears on the upper right)
-   **`banner_text`**: the banner text (the text that appears on the upper left)
-   **`type`=3**: Type 3 specifies this is a New Recaptcha **Image Group API**
-   **`grid`**: Optional grid parameter specifies what grid individual images in captcha are aligned to (string, width+"x"+height, Ex.: "2x4", if images aligned to 4 rows with 2 images in each. If not supplied, dbc will attempt to autodetect the grid.

**What's the response from the Image Group API?**  
-   **`captcha`**: id of the provided captcha, if the **`text`** field is null, you will have to pool the url <http://api.dbcapi.me/api/captcha/captcha_id> until it becomes available

-   **`is_correct`**: (0 or 1) specifying if the captcha was marked as incorrect or unreadable

-   **`text`**: a json-like list of the index for each image that should be clicked. for example:

                  [1, 4, 6]
              
    where the images that should be clicked are the first, the fourth and the six, counting from left to right and up to bottom


# New Recaptcha by Token API support (reCAPTCHA v2 and reCAPTCHA v3)


## What's "new reCAPTCHA by Token"?


They're new reCAPTCHA challenges that typically require the user to identify and click on certain images. They're not to be confused with traditional word/number reCAPTCHAs (those have no images).

For your convenience, we implemented support for New Recaptcha by Token API. If your software works with it, and supports minimal configuration, you should be able to decode captchas using Death By Captcha in no time.

-   **Token Image API**: Provided a site url and site key, the API returns a token that you will use to submit the form in the page with the reCaptcha challenge.

## reCAPTCHA v2 API FAQ:

**What's the Token Image API URL?**   
To use the Token Image API you will have to send a HTTP POST Request to <http://api.dbcapi.me/api/captcha>

**What are the POST parameters for the Token image API?**

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`type`=4**: Type 4 specifies this is a New Recaptcha Token Image API
-   **`token_params`=json(payload)**: the data to access the recaptcha challenge
json payload structure:
    -   **`proxy`**: your proxy url and credentials (if any). Examples:
        -   <http://127.0.0.1:3128>
        -   <http://user:password@127.0.0.1:3128>
    
    -   **`proxytype`**: your proxy connection protocol. For supported proxy types refer to Which proxy types are supported?. Example:
        -   HTTP
    
    -   **`googlekey`**: the google recaptcha site key of the website with the recaptcha. For more details about the site key refer to What is a recaptcha site key?. Example:
        -   6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-
    
    -   **`pageurl`**: the url of the page with the recaptcha challenges. This url has to include the path in which the recaptcha is loaded. Example: if the recaptcha you want to solve is in <http://test.com/path1>, pageurl has to be <http://test.com/path1> and not <http://test.com>.

    -   **`data-s`**: This parameter is only required for solve the google search tokens, the ones visible, while google search trigger the robot protection. Use the data-s value inside the google search response html. For regulars tokens don't use this parameter.
    
The **`proxy`** parameter is optional, but we strongly recommend to use one to prevent token rejection by the provided page due to inconsistencies between the IP that solved the captcha (ours if no proxy is provided) and the IP that submitted the token for verification (yours).

**Note**: If **`proxy`** is provided, **`proxytype`** is a required parameter.

Full example of **`token_params`**:
```json
{
  "proxy": "http://127.0.0.1:3128",
  "proxytype": "HTTP",
  "googlekey": "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
  "pageurl": "http://test.com/path_with_recaptcha"
}
```

Example of **`token_params`** for google search captchas:
```json
{
  "googlekey": "6Le-wvkSA...",
  "pageurl": "...",
  "data-s": "IUdfh4rh0sd..."
}
```

**What's the response from the Token image API?**  
The token image API response has the same structure as regular captchas' response. Refer to Polling for uploaded CAPTCHA status for details about the response. The token will come in the text key of the response. It's valid for one use and has a 2 minute lifespan. It will be a string like the following:
```bash
"03AOPBWq_RPO2vLzyk0h8gH0cA2X4v3tpYCPZR6Y4yxKy1s3Eo7CHZRQntxrdsaD2H0e6S3547xi1FlqJB4rob46J0-wfZMj6YpyVa0WGCfpWzBWcLn7tO_EYsvEC_3kfLNINWa5LnKrnJTDXTOz-JuCKvEXx0EQqzb0OU4z2np4uyu79lc_NdvL0IRFc3Cslu6UFV04CIfqXJBWCE5MY0Ag918r14b43ZdpwHSaVVrUqzCQMCybcGq0yxLQf9eSexFiAWmcWLI5nVNA81meTXhQlyCn5bbbI2IMSEErDqceZjf1mX3M67BhIb4"
```

## What's "new reCAPTCHA v3"?

This API is quite similar to the tokens(reCAPTCHA v2) API. Only 2 new parameters were added, one for the `action` and other for the **minimal score(`min-score`)**

reCAPTCHA v3 returns a score from each user, that evaluate if user is a bot or human. Then the website uses the score value that could range from 0 to 1 to decide if will accept or not the requests. Lower scores near to 0 are identified as bot.

The `action` parameter at reCAPTCHA v3 is an additional data used to separate different captcha validations like for example **login**, **register**, **sales**, **etc**.

## reCAPTCHA v3 API FAQ:

**What is `action` in reCAPTCHA v3?**  
Is a new parameter that allows processing user actions on the website differently.

To find this we need to inspect the javascript code of the website looking for call of grecaptcha.execute function. Example: 
```javascript
grecaptcha.execute('6Lc2fhwTAAAAAGatXTzFYfvlQMI2T7B6ji8UVV_f', {action: something})
```
Sometimes it's really hard to find it and we need to look through all javascript files. We may also try to find the value of action parameter inside ___grecaptcha_cfg configuration object. Also we can call grecaptcha.execute and inspect javascript code. The API will use "verify" default value it if we won't provide action in our request.

**What is `min-score` in reCAPTCHA v3 API?**  
The minimal score needed for the captcha resolution. We recommend using the 0.3 min-score value, scores highers than 0.3 are hard to get.

**What are the POST parameters for the reCAPTCHA v3 API?**

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`type`=5**: Type 5 specifies this is reCAPTCHA v3 API
-   **`token_params`**=json(payload): the data to access the recaptcha challenge
json payload structure:
    -   **`proxy`**: your proxy url and credentials (if any).Examples:
        -   <http://127.0.0.1:3128>
        -   <http://user:password@127.0.0.1:3128>
    
    -   **`proxytype`**: your proxy connection protocol. For supported proxy types refer to Which proxy types are supported?. Example: 
        -   HTTP
    
    -   **`googlekey`**: the google recaptcha site key of the website with the recaptcha. For more details about the site key refer to What is a recaptcha site key?. Example:
        -   6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-
    
    -   **`pageurl`**: the url of the page with the recaptcha challenges. This url has to include the path in which the recaptcha is loaded. Example: if the recaptcha you want to solve is in <http://test.com/path1>, pageurl has to be <http://test.com/path1> and not <http://test.com>.
    
    -   **`action`**: The action name.
    
    -   **`min_score`**: The minimal score, usually 0.3
    
The **`proxy`** parameter is optional, but we strongly recommend to use one to prevent rejection by the provided page due to inconsistencies between the IP that solved the captcha (ours if no proxy is provided) and the IP that submitted the solution for verification (yours).

**Note**: If **`proxy`** is provided, **`proxytype`** is a required parameter.

Full example of **`token_params`**:
```json
{
  "proxy": "http://127.0.0.1:3128",
  "proxytype": "HTTP",
  "googlekey": "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
  "pageurl": "http://test.com/path_with_recaptcha",
  "action": "example/action",
  "min_score": 0.3
}
```

**What's the response from reCAPTCHA v3 API?**  
The response has the same structure as regular captcha. Refer to [Polling for uploaded CAPTCHA status](https://deathbycaptcha.com/api#polling-captcha) for details about the response. The solution will come in the **text** key of the response. It's valid for one use and has a 1 minute lifespan.


## Testing

### Setup test environment

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from sample:

```bash
cp .env.sample .env
```

3. Set valid credentials in `.env`:

```bash
DBC_USERNAME=your_dbc_username
DBC_PASSWORD=your_dbc_password
```

4. Ensure browser + driver are available (`firefox` + `geckodriver` by default).

### Run Selenium integration test

```bash
npm run test:integration:selenium
```

### Run API basic integration test

```bash
npm run test:integration:api
```

This test validates:

- server/user check (`get_user`)
- balance (`get_balance`)
- upload text captcha (`type=0`) using `images/normal.jpg`
- decode response contains text
- report call returns boolean

Test file:

- [tests/integration/api.basic.integration.test.js](tests/integration/api.basic.integration.test.js)

### Run unit tests

```bash
npm run test:unit
```

### Run unit coverage

```bash
npm run test:coverage
```

### Run full integration suite

```bash
npm run test:integration
```

The test file is:

- [tests/integration/selenium.integration.test.js](tests/integration/selenium.integration.test.js)

## CI

### GitLab unit test matrix

GitLab CI is configured in:

- [.gitlab-ci.yml](.gitlab-ci.yml)

The pipeline runs unit tests on Node.js versions:

- 20
- 22
- 24

Each matrix job runs:

```bash
npm install
npm run test:coverage
```

Coverage is visible in the GitLab job output and the `coverage/` folder is uploaded as a job artifact.

GitLab also runs the basic API integration test on Node.js 24.

For credentials, the integration job tries these options in order:

1. local `.env` file in the workspace
2. `DBC_ENV_FILE` GitLab variable (File type recommended)
3. `DBC_ENV` GitLab variable with full `.env` contents

This avoids declaring multiple separate username/password variables in GitLab.

### Run with gitlab-ci-local

For local `gitlab-ci-local` runs, the easiest option is a local-only variables file:

1. Copy [ .gitlab-ci-local-variables.example.yml ](.gitlab-ci-local-variables.example.yml) to `.gitlab-ci-local-variables.yml`
2. Fill your real credentials there
3. Run:

```bash
gitlab-ci-local --file ./.gitlab-ci.yml
```

`gitlab-ci-local` loads `.gitlab-ci-local-variables.yml` automatically, and the pipeline will pass `DBC_ENV` into the integration job without requiring committed `.env` credentials.

### GitHub Actions

GitHub Actions is configured in:

- [.github/workflows/unit-tests.yml](.github/workflows/unit-tests.yml)
- [.github/workflows/unit-tests-node22.yml](.github/workflows/unit-tests-node22.yml)
- [.github/workflows/unit-tests-node24.yml](.github/workflows/unit-tests-node24.yml)
- [.github/workflows/coverage.yml](.github/workflows/coverage.yml)
- [.github/workflows/api-integration.yml](.github/workflows/api-integration.yml)

#### Unit Tests workflow

- Runs as separate workflows for Node.js 20, 22 and 24
- Each executes:

```bash
npm install
npm run test:unit
```

- Uses only native GitHub Actions
- Exposes native workflow badges per Node.js version

#### Coverage workflow

- Runs on Node.js 22
- Executes:

```bash
npm install
npm run test:coverage
```

- Uses only native GitHub Actions
- Uploads the `coverage/` folder as an artifact
- Exposes a separate native coverage badge

#### API Integration workflow

- Runs the basic API integration test on Node.js 24
- Executes:

```bash
npm install
npm run test:integration:api
```

- Uses GitHub secrets:
    - `DBC_USERNAME`
    - `DBC_PASSWORD`
- Optional runtime env in workflow:
    - `MOZ_HEADLESS=1`
- No committed `.env` file is required in GitHub Actions

```bash
DBC_USERNAME=your_dbc_username
DBC_PASSWORD=your_dbc_password
```

- If either secret is missing, the workflow skips the integration test without failing the pipeline
- Exposes a native GitHub Actions workflow badge

---

### Tests results

| Workflow | Node | Status |
|---|:---:|---|
| Unit Tests | 20 | [![Unit Tests Node 20](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests.yml) |
| Unit Tests | 22 | [![Unit Tests Node 22](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node22.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node22.yml) |
| Unit Tests | 24 | [![Unit Tests Node 24](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml) |
| API Integration | 24 | [![API Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml) |
| Selenium Integration | 24 | [![Selenium Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/selenium-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/selenium-integration.yml) |
| Coverage | 22 | [![Coverage](https://img.shields.io/endpoint?url=https://deathbycaptcha.github.io/deathbycaptcha-api-client-nodejs/coverage-badge.json)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/coverage.yml) |

