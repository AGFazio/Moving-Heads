# Moving Heads xLights Model Generator

Generates xLights `.xmodel` files for DMX moving head fixtures using a JSON fixture definition file.

## Files

- **`moving_heads_channel_types.json`** — Fixture definitions: channel order, motor limits, pan/tilt orientation, and reverse rotation settings.
- **`gen_xmodel.ps1`** — PowerShell script that reads the JSON and outputs `.xmodel` files ready to import into xLights.

## How It Works

Each fixture in the JSON defines its DMX channel list in order. The position of each channel in the list is its DMX channel number (1-indexed). The script uses this to automatically assign the correct channel numbers to pan, tilt, dimmer, shutter, and color wheel in the generated model.

Each run produces files for **1, 2, 4, 6, and 8 heads**. The generated `.xmodel` files are organized in the `Files/` directory with a subdirectory per head count:

```
Files/
├── 1 Head/
│   ├── 1 head Fixture Name.xmodel
│   └── ...
├── 2 Heads/
├── 4 Heads/
├── 6 Heads/
└── 8 Heads/
```

Each `.xmodel` file contains:
- **4 Single Line string models** (MH Pan, MH Tilt, MH Dimmer, MH Shutter) — span all heads using `@MHN:channel` relative references, useful for sequencing all heads together on one row.
- **Individual DmxMovingHeadAdv head models** (MH1, MH2, …) — one per head, with full motor configuration.

## JSON Structure

```json
{
    "moving_heads": [
        {
            "name": "Fixture Name",
            "channels": [
                "Pan",
                "Pan Fine",
                "Tilt",
                "Tilt Fine",
                "Pan & Tilt Speed",
                "Dimming",
                "Strobe",
                "Color Wheel",
                "Gobo",
                "Reset"
            ],
            "pan_motor": {
                "min_limit": -180,
                "max_limit": 180,
                "range_of_motion": 540,
                "reverse": 1,
                "orient_home": 270
            },
            "tilt_motor": {
                "min_limit": -180,
                "max_limit": 180,
                "range_of_motion": 270,
                "reverse": 0,
                "orient_home": 135,
                "orient_zero": 45
            }
        }
    ],
    "channel_types": [ ... ]
}
```

### Motor Fields

| Field | Description |
|---|---|
| `min_limit` / `max_limit` | Physical rotation limits in degrees |
| `range_of_motion` | Total degrees of travel (e.g. 540 for pan, 270 for tilt) |
| `reverse` | `1` = reverse rotation (counter-clockwise), `0` = normal (clockwise) |
| `orient_home` | Angle the fixture points at DMX value 0 (pan) |
| `orient_zero` | Angle considered "zero/up" for tilt |

### Supported Channel Names

`Pan`, `Pan Fine`, `Tilt`, `Tilt Fine`, `Pan & Tilt Speed`, `Dimming`, `Strobe`, `Color Wheel`, `Gobo`, `Gobo Rotate`, `Color Mirror`, `Prism`, `Prism Rotate`, `Focus`, `Zoom`, `Frost`, `Reset`, `Blank`

Use `Blank` for any channel that has no function or is reserved.

## Usage

1. Edit `moving_heads_channel_types.json` to add or update fixtures.
2. Run the generator script (output goes to the same folder as the script):

```powershell
& ".\gen_xmodel.ps1"
```

3. Import the generated `.xmodel` files into xLights via **File → Import → Import Model**.

## Notes

- Color wheel colors and DMX trigger values in the generated models are set to generic defaults. Update these per fixture in xLights after importing if your fixture has specific color positions.
- When adding new fixtures to the JSON, make sure each entry (except the last) is followed by a comma — missing commas are the most common JSON syntax error.
