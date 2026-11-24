# DeathByCaptcha actor for Apify

An Apify actor that solves a CAPTCHA task with DeathByCaptcha and stores
the solution in the run dataset.

This is the public half of the Apify work: the actor an Apify user runs.
The internal agent that pulls datasets from Apify for our own analysis
lives in the other ticket and is not part of this example.

It is an example inside the Node.js client, not a published package. The
actor is deployable as it stands: `apify-cli push` from this folder, or
link this folder's code to an Apify actor.

## Files

- `.actor/actor.json` — actor metadata.
- `INPUT_SCHEMA.json` — the input the platform renders.
- `Dockerfile` — `apify/actor-node:22`, installs the dependencies.
- `src/main.js` — the Apify lifecycle: read input, solve, push the item.
- `src/solve.js` — the solve logic, with the client injected so it can be
  unit tested without the network.

## Input

| Field | Meaning |
| --- | --- |
| `type` | DeathByCaptcha type: 4 reCAPTCHA v2, 5 v3, 12 Turnstile, 16 Amazon WAF, 21 DataDome, 0 image. Defaults to 4. |
| `params` | Object with the type parameters: `googlekey`/`sitekey`, `pageurl`, `iv`, `context`, `action`, `min_score`… |
| `image` | Base64 image for type 0. |
| `timeout` | Optional seconds; the client defaults to 60 for images and 120 for tokens. |

For the token types that are bound to the exit IP, put `proxy` and
`proxytype` inside `params`, exactly as the API clients do:

```json
{
  "type": 16,
  "params": {
    "sitekey": "...",
    "pageurl": "https://example.test/",
    "proxy": "http://user:pass@127.0.0.1:1234",
    "proxytype": "HTTP"
  }
}
```

The actor solves from the Apify exit IP, so the token is valid for a
target fetched from that same IP. If another system fetches the target,
it must use the same proxy or the token will be rejected.

## Output

One dataset item per run:

```json
{ "type": 16, "captcha": 123456789, "text": "03AOPBWq_..." }
```

## Credentials

Actor secrets, never in the input and never in the repository:

- `DBC_USERNAME` and `DBC_PASSWORD`, or
- `DBC_AUTHTOKEN`.

## Local run

```bash
cd examples/apify
npm install
mkdir -p storage/key_value_stores/default
cat > storage/key_value_stores/default/INPUT.json <<'JSON'
{ "type": 4, "params": { "googlekey": "6Le...", "pageurl": "https://example.test/" } }
JSON
DBC_USERNAME=your_username DBC_PASSWORD=your_password npm start
```

A local run needs no Apify token. The result lands in
`storage/datasets/default/000000001.json`, one item per solve:

```json
{ "type": 4, "captcha": 1210686518, "text": "0cAFcWeA7..." }
```

Both `storage/` and `node_modules/` are ignored by git.

## Deploy

```bash
cd examples/apify
apify-cli push
```

The listing in the Apify Store waits for the store rules check; the code
here is the same code that will be pushed.

## Tests

From the repository root:

```bash
npm run test:unit
```

`tests/unit/apify.solve.test.js` covers the parameter key per type, the
image and token paths and the failure case, with an injected client.
