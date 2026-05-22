# Moving Heads — xLights .xmodel Builder

A web-based tool for generating [xLights](https://xlights.org) `.xmodel` files for DMX moving heads — no coding or XML editing required.

## Try it now

Open the tool in any browser:

**[xmodel-builder.html](https://agfazio.github.io/Moving-Heads/xmodel-builder.html)**

It runs entirely in your browser. Nothing is uploaded or saved anywhere unless you explicitly choose to share it.

---

## What it does

Pick a moving-head fixture (or build a new one), set the number of heads and the DMX start channel, and the tool generates a ready-to-import xLights `.xmodel` file with:

- One `DmxMovingHeadAdv` model per physical head
- "String Group" sub-models you can drive together from the layout view (Dimmer, Shutter, Pan, Tilt, etc.)
- A Model Group containing all heads (when you have more than one)
- Properly mapped channel positions, pan/tilt motor parameters, color wheel slots, and head orientation

The output matches xLights' native `.xmodel` format — import it, place your heads in the layout, and you're done.

---

## How to use it

### If your fixture is already in the preset list

1. **Choose preset** mode is selected by default.
2. Pick your fixture from the **Load a preset** dropdown and click **Load**.
3. Set **Quantity of heads** and **DMX Start Channel** for your install.
4. In **Pan motor parameters**, choose the **Head orientation at rest** (Right / Left / Front / Back) — this is which way the head points when powered off, viewed from in front of the stage.
5. Tick **Mount → Upside Down** if the fixtures are hung upside down.
6. Click **Generate and Download xmodel**.
7. In xLights: **File → Import → Import Model From File** and pick the downloaded `.xmodel`.

### If your fixture isn't in the list yet

1. Switch the radio to **Add new Moving Head**.
2. Set **Channels per fixture** to the total channel count of your unit (from the manual).
3. In **Channel layout**, set each row's type via the dropdown. Channel types can only be used once per fixture (except Blank).
4. Fill in **Pan Direction**, **Tilt range**, **Mount**, and choose orientation.
5. (Optional) Customize the **Color Wheel** slot count and colors/DMX values.
6. Scroll to the bottom **Save as Preset** section, enter a **Model name**, and click **Add New Model as Preset**.
7. In the popup, click **Open a GitHub issue (new tab)** — your fixture's full spec is pre-filled. Just click **CREATE** on the GitHub page.
8. The maintainer will merge it into the catalog. The next time anyone opens the tool, your fixture appears in the preset list for everyone.

---

## Pan Direction explained

Hold the powered-off head and rotate it **clockwise** (viewed from above) until it stops. Power it on:

- If it turns back **counter-clockwise** to reach rest → set Pan Direction to **CCW**.
- If it stays put, or slightly returns clockwise → set Pan Direction to **CW**.

Click the **?** next to the Pan Direction field in the tool for the same instructions.

---

## Head orientation explained

"At rest" is where the head points when it's powered on with no commands. Looking at the stage from the audience side:

- **Right / Left** — head points to one side of the stage
- **Front** — head points toward the viewer
- **Back** — head points away from the viewer (toward the upstage wall)

Only valid combinations are selectable: CCW direction grays out Left, CW grays out Right.

---

## Files in this repo

| File | Purpose |
|------|---------|
| `xmodel-builder.html` | The web tool itself. Open in any browser. |
| `moving_heads_channel_types.json` | Catalog of all known fixtures + channel types. The tool fetches this live on each load. |
| `gen_xmodel.ps1` | Legacy PowerShell script (predecessor of the web tool, kept for reference). |

---

## For maintainers — adding a submitted fixture

When a user opens a GitHub issue titled **"New fixture: ..."**:

1. Open the issue. The fixture's JSON object is in the body, in a markdown code block.
2. Edit `moving_heads_channel_types.json`.
3. Append the JSON object to the `moving_heads` array.
4. Commit + push.
5. Close the issue.

The tool fetches this JSON on every page load, so the new fixture is available to everyone immediately.

---

## Local development

The tool is a single `xmodel-builder.html` file — no build step, no dependencies. To work on it:

1. Clone the repo.
2. Edit `xmodel-builder.html`.
3. Open it in a browser to test. Note that when loaded from `file://`, the remote preset fetch may be CORS-blocked depending on the browser — the tool falls back to its baked-in preset list silently.
4. Commit and push when ready.

---

## License

See the repository's LICENSE file (if present).
