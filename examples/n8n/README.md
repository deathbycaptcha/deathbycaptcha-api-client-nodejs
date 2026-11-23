# n8n workflow example

An importable n8n workflow that solves CAPTCHAs with DeathByCaptcha and
returns the token for the rest of your workflow.

It is an example, not an npm package: nothing is published to a registry.
The workflow uses n8n's built-in HTTP Request nodes, so it works on any
n8n installation that can reach `api.dbcapi.me`.

## Files

- `deathbycaptcha-solve.workflow.json` — the workflow to import.
- `solve.js` — the reference implementation (upload + poll) used by the
  unit tests; the workflow mirrors it with HTTP Request nodes.
- `build-workflow.js` — regenerates the workflow JSON from the code above.

## Import

In n8n: **Workflows → Import from File** and pick
`deathbycaptcha-solve.workflow.json`.

## Credentials

The workflow reads the account from the environment:

```bash
# either
DBC_USERNAME=your_username
DBC_PASSWORD=your_password
# or
DBC_AUTHTOKEN=your_authtoken
```

Self-hosted n8n must be allowed to read environment variables in nodes:

```bash
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

n8n Cloud does not expose environment variables to nodes, so this template
does not run there as-is. On Cloud, wait for the community node or proxy
the API call through a service you control.

## Usage

The input items decide what is solved:

| Field | Meaning |
| --- | --- |
| `type` | DeathByCaptcha type: 4 reCAPTCHA v2, 5 v3, 12 Turnstile, 16 WAF, 21 DataDome, 0 image. Defaults to 4. |
| `params` | Object with the type parameters: `googlekey`/`sitekey`, `pageurl`, `action`, `min_score`, `iv`, `context`… |
| `image_base64` | Base64 image for image challenges (type 0). |

Example input item:

```json
{ "type": 4, "params": { "googlekey": "6Le...", "pageurl": "https://example.test/" } }
```

The workflow outputs the DeathByCaptcha response for each item:

```json
{ "captcha": 123456789, "text": "03AOPBWq_...", "is_correct": true }
```

Read the token from `$json.text` in the next node.

## How it works

1. **Build request** (Code node): turns the input item and the environment
   into the form body DeathByCaptcha expects, including the right
   `*_params` key for the type.
2. **Upload CAPTCHA** (HTTP Request): `POST /captcha`.
3. **Wait 2s** (Wait node).
4. **Get result** (HTTP Request): `GET /captcha/{id}`.
5. **Solved?** (If node): loops back to the wait while `text` is empty.

## After the token

- Send it to your target with an HTTP Request node, or
- Inject it into a page with the Playwright or Puppeteer examples in this
  repository (`examples/playwright/`, `examples/puppeteer/`).

## Limitations

- The poll loop runs until the solve succeeds or the n8n execution times
  out; set the execution timeout to something sensible.
- Token types tied to the exit IP (Turnstile, WAF, DataDome) need the same
  proxy for the browser and for DeathByCaptcha.
- The image type needs `image_base64`; the workflow does not download
  images for you.
- This example does not ship an n8n community node. If you need one, the
  API metadata in `deathbycaptcha-agent-api-metadata` describes the same
  endpoints for a package.

## Tests

```bash
npm run test:unit
```

The unit tests cover `solve.js`: body construction, the parameter key per
type, the upload and poll flow and the timeout.
