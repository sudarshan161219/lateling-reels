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
  scripts/voice.mjs         AI voiceover (Gemini text-to-speech)
  public/music/             music tracks; one is picked at random for each render
prompts/script-writer.md    prompt for Gemini: writes a props JSON
n8n/                        n8n workflow: Gemini script, render, MP4 address
.github/workflows/render-reel.yml
```

## Compositions

| Id | Length | What it shows |
| --- | --- | --- |
| `BeforeAfter` | 20 to 25 s | Hook, six tabs opened by hand, then Lateling finds the order and fills the reply |
| `FeatureDemo` | 20 to 25 s | One feature in three steps: `needs-attention`, `find-order`, `order-detail`, `reply-template` or `gmail-panel` |
| `Tips` | 20 to 25 s | Three tips as text on screen. Lateling appears only in the last scene |
| `Trust` | 20 to 25 s | Read-only access, and order data that stays in the browser |

Every composition ends with the same end card: Lateling, "Free plan on the Shopify App Store", the landing page address, and "by buildwithsud". The maker name is `MAKER` in `reels/src/theme.ts`.

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

A 23 second video takes about a minute and a half on a 4-core laptop.

To check a single frame without rendering the whole video:

```bash
npx remotion still src/index.ts BeforeAfter out/frame.png --frame=200 --props=props/examples/before-after.json
```

## Captions, safe margins, audio

- Captions are part of the picture, so they show when the video is muted.
- Nothing important is drawn in the top 240 px, the bottom 430 px, or under the button column on the right, where Instagram and YouTube put their own interface. The values are in `reels/src/theme.ts` (`SAFE`).
- Music: put one or more tracks (`.mp3`, `.m4a`, `.wav`, `.ogg`) in `reels/public/music/` and push. Every render, local or in the Action, then picks one at random and plays it at half volume. With no tracks in the folder the video is silent. Add `--no-music` to the render command for a silent video.
- Use only tracks whose licence lets you use them in adverts and keep the file in a public repository. Chart songs and sounds from Instagram's own library do not qualify: a video with one burned in gets muted or taken down.
- To choose the track or use your own recorded voiceover for one video, name the files in the props file. They are looked up in `reels/public/`. An `https://` URL also works.

```json
"audio": {
  "musicSrc": "music/calm-track.mp3",
  "musicVolume": 0.3,
  "voiceoverSrc": "voiceover.mp3"
}
```

The music loops, fades in and out, and is turned down when a voiceover is present. The repo includes five CC0 tracks. Their sources are listed in `reels/public/music/SOURCES.md`.

## AI voiceover

A props file can carry `voiceover`: one spoken line per scene, without the end card. The render sends each line to Gemini text-to-speech, puts the lines on one track so each starts with its scene, and makes a scene longer if its line needs more time. The end card line is fixed in `reels/scripts/voice.mjs`. Music is turned down while a voiceover is present.

```json
"voiceover": [
  "Lateling can read your orders. Nothing else.",
  "It has read-only access. It cannot refund, cancel or change anything.",
  "Order data goes from Shopify to your browser. It is not stored on our servers."
]
```

The voice needs a Gemini API key in the environment variable `GEMINI_API_KEY`.

- In the Action: add a repository secret named `GEMINI_API_KEY` under **Settings → Secrets and variables → Actions**.
- Locally: set the variable in your shell before `npm run render`.

Without the key, or if the speech request fails, the video is rendered without a voice and the log says why. `--no-voice` skips the voice on purpose.

The voice is `Sulafat` on the model `gemini-3.8-flash-tts`. Set `TTS_VOICE`, `TTS_MODEL` or `TTS_STYLE` in the environment to change them. `TTS_MOCK=1` replaces the speech with a tone of about the same length, to check timing without a key.

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
- deletes reel releases older than 14 days, with their tags, so the Releases page stays short. To keep them for a different time, add a repository variable `REEL_KEEP_DAYS` under **Settings → Secrets and variables → Actions → Variables**. Only releases tagged `reel-*` are touched.

The address has this form:

```
https://github.com/OWNER/REPO/releases/download/reel-<id>/lateling-<composition>-<id>.mp4
```

It is public only if the repository is public. In a private repository the asset needs a token to download (see below).

Each `request_id` can be used once, because a release tag must be unique.

## YouTube channel art

`ChannelBanner` (2560 x 1440) and `ChannelAvatar` (800 x 800) are stills for the buildwithsud developer channel, in the same colours as the reels. Add a row to `PROJECTS` in `reels/src/compositions/Channel.tsx` for each new product. The banner keeps its text inside the 1546 x 423 area that phones show. The project cards and terminal on the sides only show on desktop and TV.

```
cd reels
npx remotion still src/index.ts ChannelBanner out/channel-banner.png
npx remotion still src/index.ts ChannelAvatar out/channel-avatar.png
```

## n8n workflow

`n8n/lateling-reel-render.workflow.json` is a ready workflow: it asks Gemini for a script, starts the Action, waits for the render, then uploads the MP4 to YouTube as a Short. Instagram is posted by hand from the **Posted** node's output. The scheduled run is on Tuesday at 09:00.

```
Once a week / Run manually
  -> Config                 composition for this run, an angle, a store type, request id
  -> Fetch prompt           prompts/script-writer.md from this repository
  -> Recent reels           hooks of the last reels, so they are not repeated
  -> Build Gemini request
  -> Gemini script          returns the props JSON, with the voiceover lines
  -> Parse props            checks it is JSON, no em dashes, removes "audio", takes out the post text
  -> Start render           workflow_dispatch
  -> Wait for render        3 minutes
  -> Get release            reel-<requestId>; retried every 30 s, up to 20 times
  -> Reel ready             videoUrl, fileName, caption, hashtags, postText, postTextShort,
                            hook, composition, feature, props
  -> Post it?               yes for scheduled runs, no for runs started by hand
  -> Download video         the MP4 as a file
  -> YouTube upload         a vertical video under 3 minutes is listed as a Short
  -> Posted                 youtubeUrl, plus videoUrl and postText for posting to Instagram by hand
```

### Setup

1. In n8n choose **Import from File** and pick the JSON file.
2. Open the **Config** node. Check `OWNER`, `REPO`, the Gemini model, and the rotation. `FORCE_COMPOSITION` and `TOPIC` are there for one-off runs.
3. **Gemini script** node: select your Header Auth credential for Gemini (header name `x-goog-api-key`).
4. **Start render** and **Get release** nodes: select a Header Auth credential for GitHub. Header name `Authorization`, value `Bearer <token>`. Use a fine-grained personal access token limited to this repository with **Actions: read and write** and **Contents: read**.
5. Run it once with **Run manually**. This renders a reel and does not post it.
6. Set up posting (next section), then activate the workflow.

Gemini also writes the text for the post. **Reel ready** gives it in four forms:

| Field | Content |
| --- | --- |
| `caption` | 2 or 3 sentences, at most 200 characters: the frustration, a point of view, and a question for the comments. No call to install |
| `hashtags` | a list of 5 to 8 tags, each with its `#` |
| `postText` | the caption, a blank line, then all hashtags. For Instagram and Facebook |
| `postTextShort` | the caption with as many hashtags as fit in 280 characters. For X |

Every script follows the same story arc, set in `prompts/script-writer.md`: the hook names a frustration, the next scene makes it a concrete moment at the example store, Lateling appears as the fix, and one line gives a point of view. Nothing in the video or the caption asks the viewer to install or try the app. The end card is the only mention of the free plan.

To keep videos from coming out alike, each run gives Gemini three things: an angle picked at random from `ANGLES` in the **Config** node, a store type picked from `STORES`, and the hooks of recent reels to avoid. The hooks are read from the release notes, so the list covers the reels that still have a release. Edit `ANGLES` to steer what the videos are about. Every angle must be about something the app really does.

A run started with **Run manually** picks the composition and feature at random. Scheduled runs go through `ROTATION` in order, one entry per run, and FeatureDemo runs go through `FEATURES` in order.

If the render fails, the workflow stops at **Render failed** after about 13 minutes. The reason is in the run's log under the repository's Actions tab. The usual cause is a script that does not match the schema, for example text that is too long. Running the workflow again gets a new script.

**Fetch prompt** reads the prompt from the `main` branch through the GitHub API (`api.github.com`), so a prompt change takes effect once it is pushed. It needs no token while the repository is public.

### Posting

Scheduled runs upload every reel to YouTube. Runs started by hand upload only when `POST_ON_MANUAL` is `true` in the **Config** node.

**Schedule.** The **Once a week** node holds the cron expression `0 9 * * 2`: Tuesday at 09:00, about 4 reels a month. For two a week, change it to `0 9 * * 2,5`, which adds Friday. The workflow's time zone is set to `Asia/Kolkata` under its settings. n8n must be running at that time and the workflow must be active. A run that is missed because the computer was off is not made up later.

**YouTube.**

1. In the Google Cloud console create a project, enable **YouTube Data API v3**, and create an OAuth client of type Web application. As the redirect address use the one n8n shows in the credential window.
2. On the OAuth consent screen set the publishing status to **In production**. In **Testing** the sign-in expires after 7 days.
3. In n8n create a **YouTube OAuth2 API** credential with the client id and secret, sign in with the channel's Google account, and select it in the **YouTube upload** node.

Google keeps videos uploaded by a new API project private until the project has passed its API audit. Until then the upload works but the Short is not public, whatever `YOUTUBE_PRIVACY` says. The audit is requested with Google's YouTube API Services audit form.

**Instagram, by hand.** Open the run's **Posted** node. Download the MP4 from `videoUrl` and paste `postText` as the caption.

If the YouTube upload fails, the run stops with an error on the **YouTube upload** node. The video is still on the release page, so you can upload it by hand.

### The two GitHub calls

For reference, or to build the calls yourself. Both need `Authorization: Bearer <token>` and `Accept: application/vnd.github+json`.

Start a render. `props` must be a string, not an object. GitHub answers `204 No Content` and does not wait for the render.

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

Find the video. This returns `404` until the render has finished.

```
GET https://api.github.com/repos/OWNER/REPO/releases/tags/reel-20261112-093000
```

In the `200` response, `assets[0].browser_download_url` is the public address. If the repository is ever made private, download `assets[0].url` with the token and the header `Accept: application/octet-stream` instead.

The Action deletes reel releases older than 14 days, so a `videoUrl` stops working after that. Post or download a reel before then.

## Changing things

- Facts about the app that must never vary (the two permissions, what the app cannot do, the end card text) are fixed in code, not in props: `reels/src/compositions/Trust.tsx` and `reels/src/theme.ts`.
- Colours and fonts follow the landing page and live in `reels/src/theme.ts` and `reels/src/fonts.ts`. Fonts are Noto Sans and Noto Serif, loaded from Google Fonts at render time, so the render needs internet access.
- After changing `reels/src/schemas.ts`, run `npm run schemas` in `reels` and paste the output into the "JSON schemas" section of `prompts/script-writer.md`.

## Remotion licence

Remotion is not MIT licensed. As of November 2026 its [licence page](https://www.remotion.dev/docs/license) says individuals and companies of up to 3 people can use it for free, including commercially. Larger companies need a paid company licence, and automated rendering falls under "Remotion for Automators" ($0.01 per render, $100 a month minimum). Check the page again if the team grows.
