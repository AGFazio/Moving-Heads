# Moving Heads — xLights .xmodel Builder

A web-based tool for generating [xLights](https://xlights.org) `.xmodel` files for DMX moving heads — no coding or XML editing required.

## Try it now

**[Open the Builder](https://agfazio.github.io/Moving-Heads/xmodel-builder.html)**

The tool runs entirely in your browser. Nothing is uploaded or saved anywhere unless you explicitly choose to share a new model via the GitHub-issue flow.

A short welcome dialog appears on first load with a quick-start summary. After dismissing it, you can revisit this README any time via the **About** link in the top-right corner of the tool.

---

## What it does

Pick a Moving Head from the preset list (or build a new one), set the number of heads, and the tool generates a ready-to-import xLights `.xmodel` file with:

- One `DmxMovingHeadAdv` model per physical head (e.g. `MH1`, `MH2`, ...)
- "String Group" sub-models you can drive together from the layout view (Dimmer, Pan, Shutter, Tilt by default; Color, Gobo, Prism, Prism Rotate, Focus, Frost optional)
- A Model Group named `Group - MH ALL` containing all heads (when you have more than one)
- Properly mapped channel positions, pan/tilt motor parameters, color wheel slots, and head orientation

> **Note on quantity:** The xLights *Advanced Moving Head* effect supports a maximum of **8 fixtures** at a time, so this tool caps **Quantity of heads** at 8. If you need more than 8 of the same fixture, generate another `.xmodel` and import it separately. xLights will continue head numbering (MH9, MH10, ...) but will spawn a new group `Group - MH ALL-2` — manually merge the new heads into the existing group in the Layout view.

The output matches xLights' native `.xmodel` format — import it, place your heads in the layout, and you're done.

The DMX start channel always defaults to 1 in the generated file. Set the actual start channel inside xLights after import (right-click the model → Channel Properties).

---

## How to use it

### If your Moving Head is already in the preset list

1. **Choose preset** mode is selected by default.
2. Pick your Moving Head from the **Load a preset Moving Head** dropdown — the tool **auto-loads** it the moment you change the selection.
3. Use the **Quantity of heads** radio buttons (1 - 8) to set how many you have.
4. In **Pan motor parameters**, choose the **Head orientation at rest** (Right / Left / Front / Back) — this is which way the head points when powered off, viewed from in front of the stage. The currently-recommended orientation for the preset's pan direction is labeled `(Recommended Position)` in green.
5. Tick **Mount → Upside Down** if the fixtures are hung upside down.
6. Click **Generate and Download xmodel**.
7. In xLights Layout, click the **Import** icon, drag a box on the layout, and choose your `.xmodel` file from your Downloads folder.

### If your Moving Head isn't in the list

1. Switch the radio to **Add new Moving Head**. The Channel layout, String Groups, Color Properties, and Save as Preset sections appear.
2. Set **Channels per fixture** to the total channel count of your unit (from the manual).
3. In **Channel layout**, set each row's type via the dropdown. Channel types can only be used once per Moving Head (except Blank, which can repeat).
4. Fill in **Pan Direction**, **Tilt range**, **Mount**, and choose the **Head orientation at rest**.
5. In **Color Properties**, choose how this Moving Head produces color:
   - **Color Wheel** — set the slot count and per-slot colors. The DMX Range field accepts either a single number (`4`) or a hyphenated range (`2-5`); ranges are averaged and rounded up.
   - **RGBW** — for LED moving heads with separate Red, Green, Blue (and optional White) LED channels. Pick the DMX channel number for each color. Set White to **0** if your fixture has no dedicated white LED (it becomes a pure RGB head).
6. Scroll to the bottom **Save as Preset** section, enter a **Model name** (use the vendor + model, e.g. *"ADJ Vizi Hex Wash 7"*), and click **Add New Model as Preset**.
7. In the popup, click **Open a GitHub issue (new tab)** — your fixture's full spec is pre-filled. Just click the green **CREATE** button on the GitHub page.
8. The maintainer will merge it into the catalog. The next time anyone opens the tool, your fixture appears in the preset list for everyone — the tool fetches the live JSON catalog on every page load.

---

## Pan Direction explained

Hold the powered-off head and rotate it **clockwise** (viewed from above) until it stops. Power it on:

- If it turns back **counter-clockwise** to reach rest → set Pan Direction to **CCW**.
- If it stays put, or slightly returns clockwise → set Pan Direction to **CW**.

Click the **?** next to the Pan Direction field in the tool for the same instructions in a popup.

---

## Head orientation explained

"At rest" is where the head points when it's powered on with no commands. Looking at the stage from the audience side:

- **Right / Left** — head points to one side of the stage
- **Front** — head points toward the viewer
- **Back** — head points away from the viewer (toward the upstage wall)

Only valid combinations are selectable: **CCW** direction grays out Left, **CW** grays out Right. The diagram next to the radio buttons rotates to show your chosen direction.

---

## Channel types

The tool's channel-type dropdown matches the xLights `NodeNames` convention. Available types:

`Blank` · `Dimmer / Intensity` · `Shutter / Strobe` · `Pan / X-axis / Horizontal` · `Pan Fine` · `Tilt / Y-axis / Vertical` · `Tilt Fine` · `Prism 1` · `Prism 2` · `Prism Rotate 1` · `Prism Rotate 2` · `Focus` · `Frost` · `Color` · `Pan & Tilt Speed` · `Lamp / Reset` · `Gobo` · `Gobo Jitter`

Older preset names (e.g. `Dimming`, `Strobe`, `Color Wheel`) are automatically translated to the new names on load.

---

## Files in this repo

| File | Purpose |
|------|---------|
| `xmodel-builder.html` | The web tool itself. Open in any browser. |
| `moving_heads_channel_types.json` | Live catalog of all known Moving Heads. The tool fetches this on every page load — updates here flow to everyone instantly. |
| `gen_xmodel.ps1` | Legacy PowerShell script (predecessor of the web tool, kept for reference). |
| `README.md` | This file. |

---

## For maintainers — adding a submitted Moving Head

When a user opens a GitHub issue titled **"New Moving Head: ..."**:

1. Open the issue. The fixture's JSON object is in the body, in a markdown code block.
2. Edit `moving_heads_channel_types.json`.
3. Append the JSON object to the `moving_heads` array.
4. Commit + push.
5. Close the issue.

The tool fetches this JSON on every page load, so the new Moving Head is available to everyone immediately.

---

## Local development

The tool is a single `xmodel-builder.html` file — no build step, no dependencies. To work on it:

1. Clone the repo.
2. Edit `xmodel-builder.html`.
3. Open it in a browser to test. Note that when loaded from `file://`, the remote preset fetch may be CORS-blocked depending on the browser — the tool falls back silently to its baked-in preset list.
4. Commit and push when ready. GitHub Pages serves the updated file within a minute.

---

## License

See the repository's LICENSE file (if present).
