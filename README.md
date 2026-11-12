# Lateling reels

Generates short vertical videos (1080x1920, 30 fps) for Lateling from a JSON file. Built with [Remotion](https://www.remotion.dev). The app's screens are recreated as React components with example data. Nothing is screen-recorded.

```
reels/                      Remotion project
  src/components/           NeedsAttentionList, OrderCard, FindOrderSearch, ReplyTemplate,
                            GmailSidePanel, BrowserTabs, and primitives.tsx
                            (Cursor, Highlight, Caption, Hook, EndCard, AudioLayer)
  src/compositions/         BeforeAfter, FeatureDemo, Tips, Trust
  src/schemas.ts            zod schema for each composition's props
  props/examples/           one sample props file per composition
  scripts/render.mjs        the render command
  public/                   put music and voiceover files here
prompts/script-writer.md    prompt for Gemini: writes a props JSON
.github/workflows/render-reel.yml
```

## Compositions

| Id | Length | What it shows |
| --- | --- | --- |
| `BeforeAfter` | 15 to 20 s | Hook, six tabs opened by hand, then Lateling finds the order and fills the reply |
| `FeatureDemo` | 10 to 15 s | One feature in three steps: `needs-attention`, `find-order`, `order-detail`, `reply-template` or `gmail-panel` |
| `Tips` | 20 to 30 s | Three tips as text on screen. Lateling appears only in the last scene |
| `Trust` | 10 to 15 s | Read-only access, and order data that stays in the browser |

Every composition ends with the same end card: Lateling, "Free plan on the Shopify App Store", and the landing page address.

The length of a video is the sum of the scene lengths in the props file's `seconds` object. A props file that does not match the schema, or whose length is outside the range above, stops the render with a message that names the field.

## Local preview

Needs Node 20 or newer.

```bash
cd reels
```

```bash
npm install
```

```bash
npx remotion studio
```

The studio opens in the browser. Pick a composition on the left. The props panel on the right is built from the zod schema, so you can edit text and timings and watch the result.

## Rendering

From the `reels` folder:

```bash
npm run render -- --comp BeforeAfter --props props/examples/before-after.json
```

The MP4 is written to `reels/out/`. Add `--out out/my-name.mp4` to choose the file name. `--comp` is one of `BeforeAfter`, `FeatureDemo`, `Tips`, `Trust`.

A 19 second video takes about a minute on a 4-core laptop.

To check a single frame without rendering the whole video:

```bash
npx remotion still src/index.ts BeforeAfter out/frame.png --frame=200 --props=props/examples/before-after.json
```

## Captions, safe margins, audio

- Captions are part of the picture, so they show when the video is muted.
- Nothing important is drawn in the top 240 px, the bottom 430 px, or under the button column on the right, where Instagram and YouTube put their own interface. The values are in `reels/src/theme.ts` (`SAFE`).
- Music and voiceover are optional. Put a royalty-free track in `reels/public/` and name it in the props file. An `https://` URL also works.

```json
"audio": {
  "musicSrc": "calm-track.mp3",
  "musicVolume": 0.12,
  "voiceoverSrc": "voiceover.mp3"
}
```

The music loops, fades in and out, and is turned down when a voiceover is present. Leave both out for a silent video. No music file is included in this repo.

## Template variables

Reply templates in a props file can use these variables. A variable with no value for the example order stays visible, as it does in the app.

`{{first_name}}` `{{customer_name}}` `{{order_name}}` `{{order_total}}` `{{items}}` `{{shipping_address}}` `{{carrier}}` `{{tracking_number}}` `{{delivery_status}}` `{{estimated_delivery}}` `{{fulfillment_status}}` `{{signoff}}`

These names are a guess at the app's real ones. If the app uses different names, change `TEMPLATE_VARIABLES` and `variableValues` in `reels/src/components/ReplyTemplate.tsx`, and the list in `prompts/script-writer.md`.

## GitHub Action

`.github/workflows/render-reel.yml` runs on `workflow_dispatch`.

| Input | Required | Meaning |
| --- | --- | --- |
| `composition` | yes | `BeforeAfter`, `FeatureDemo`, `Tips` or `Trust` |
| `props` | yes | The props, as one JSON string |
| `request_id` | no | An id you choose. The release is tagged `reel-<request_id>`. Without it the tag is `reel-<run id>` |

The job installs dependencies, renders the video, and then:

- uploads the MP4 as a workflow artifact,
- creates a GitHub Release tagged `reel-<id>` with the MP4 attached,
- writes the MP4 address in the job summary.

The address has this form:

```
https://github.com/OWNER/REPO/releases/download/reel-<id>/lateling-<composition>-<id>.mp4
```

It is public only if the repository is public. In a private repository the asset needs a token to download (see below).

Each `request_id` can be used once, because a release tag must be unique.

## Calling the Action from n8n

Create a fine-grained personal access token for this repository with **Actions: read and write** and **Contents: read**. Send it on every request as `Authorization: Bearer <token>`, together with `Accept: application/vnd.github+json`.

**1. Get the props from Gemini.** Send the contents of `prompts/script-writer.md` as the system instruction and the composition name (plus an optional topic) as the message. Ask for a JSON response (`responseMimeType: application/json`). Parse the reply to make sure it is valid JSON.

**2. Make a request id** in n8n, for example `{{ $now.toFormat('yyyyLLdd-HHmmss') }}`. Letters, digits, dots, dashes and underscores only.

**3. Start the workflow.** HTTP Request node:

```
POST https://api.github.com/repos/OWNER/REPO/actions/workflows/render-reel.yml/dispatches
```

```json
{
  "ref": "main",
  "inputs": {
    "composition": "BeforeAfter",
    "props": "{\"hook\":\"...\"}",
    "request_id": "20261112-093000"
  }
}
```

`props` must be a string, not an object. In n8n use `{{ JSON.stringify($json.props) }}`. GitHub answers `204 No Content` and does not wait for the render.

**4. Wait for the release.** Wait about 3 minutes, then poll with an HTTP Request node:

```
GET https://api.github.com/repos/OWNER/REPO/releases/tags/reel-20261112-093000
```

It returns `404` until the render has finished. Retry every 30 seconds, and give up after about 10 minutes. If it never appears, the run failed. The reason, usually a props file that did not match the schema, is in the run's log under the repository's Actions tab.

**5. Read the video address.** In the `200` response:

- `assets[0].browser_download_url` is the public address (public repositories).
- For a private repository, download `assets[0].url` with the same token and the header `Accept: application/octet-stream`, then pass the file on as binary data.

Pass that address or file to your posting workflow.

Releases pile up over time. Delete old ones from the repository's Releases page, or with `gh release delete reel-<id> --cleanup-tag`.

## Changing things

- Facts about the app that must never vary (the two permissions, what the app cannot do, the end card text) are fixed in code, not in props: `reels/src/compositions/Trust.tsx` and `reels/src/theme.ts`.
- Colours and fonts follow the landing page and live in `reels/src/theme.ts` and `reels/src/fonts.ts`. Fonts are Noto Sans and Noto Serif, loaded from Google Fonts at render time, so the render needs internet access.
- After changing `reels/src/schemas.ts`, run `npm run schemas` in `reels` and paste the output into the "JSON schemas" section of `prompts/script-writer.md`.

## Remotion licence

Remotion is not MIT licensed. As of November 2026 its [licence page](https://www.remotion.dev/docs/license) says individuals and companies of up to 3 people can use it for free, including commercially. Larger companies need a paid company licence, and automated rendering falls under "Remotion for Automators" ($0.01 per render, $100 a month minimum). Check the page again if the team grows.
