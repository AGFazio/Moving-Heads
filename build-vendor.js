#!/usr/bin/env node
// Generates a vendor-branded, single-file copy of xmodel-builder.html that only offers that vendor's fixtures.
// Usage: node build-vendor.js --vendor "Mattos Designs" --match mattos --url https://www.mattosdesigns.com [--out file.html]
const fs = require('fs');
const path = require('path');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
if (!args.vendor || !args.match) {
  console.error('Usage: node build-vendor.js --vendor "Name" --match <regex, case-insensitive> [--url https://...] [--out file.html]');
  process.exit(1);
}

const root = __dirname;
const re = new RegExp(args.match, 'i');
const slug = args.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const out = args.out || path.join(root, 'vendor', 'xmodel-builder-' + slug + '.html');

let html = fs.readFileSync(path.join(root, 'xmodel-builder.html'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'moving_heads_channel_types.json'), 'utf8'));
const presets = catalog.moving_heads.filter(p => re.test(p.name));
if (!presets.length) { console.error('No presets match /' + args.match + '/i'); process.exit(1); }

function replaceOnce(label, from, to) {
  const idx = html.indexOf(from);
  if (idx < 0) { console.error('Build failed: could not find "' + label + '" in xmodel-builder.html (template changed?)'); process.exit(1); }
  html = html.slice(0, idx) + (typeof to === 'function' ? to() : to) + html.slice(idx + from.length);
}
function replaceRegex(label, rx, to) {
  if (!rx.test(html)) { console.error('Build failed: could not find "' + label + '" in xmodel-builder.html (template changed?)'); process.exit(1); }
  html = html.replace(rx, to);
}

const vendor = args.vendor;
const vendorLink = args.url ? '<a href="' + args.url + '" target="_blank" rel="noopener" style="color:' + (args.gold || '#fbbf24') + ';">' + vendor + '</a>' : vendor;

// 1. Baked-in preset list -> vendor fixtures only
replaceRegex('BUILTIN_PRESETS array', /let BUILTIN_PRESETS = \[[\s\S]*?\n\];/, () => 'let BUILTIN_PRESETS = ' + JSON.stringify(presets, null, 2) + ';\nconst VENDOR_MATCH = new RegExp(' + JSON.stringify(args.match) + ', "i");');

// 2. Live catalog refresh keeps working but is filtered to the vendor
replaceOnce('remote preset assignment', 'BUILTIN_PRESETS = data.moving_heads;', 'BUILTIN_PRESETS = data.moving_heads.filter(p => VENDOR_MATCH.test(p.name));\n    if (BUILTIN_PRESETS.length === 0) throw new Error("No vendor presets in catalog");');
replaceOnce('default preset', /const DEFAULT_PRESET_NAME = '[^']*';/.exec(html) ? /const DEFAULT_PRESET_NAME = '[^']*';/.exec(html)[0] : '', 'const DEFAULT_PRESET_NAME = ' + JSON.stringify(presets[0].name) + ';');
replaceOnce('remote status message', "'Loaded ' + BUILTIN_PRESETS.length + ' moving heads from the repository.'", "'Loaded ' + BUILTIN_PRESETS.length + ' " + vendor.replace(/'/g, "\\'") + " moving heads.'");
replaceOnce('remote fallback message', "'Using built-in preset list (remote catalog unreachable).'", "'Using built-in preset list.'");

// 3. Branding
replaceOnce('title', '<title>xLights Moving Head .xmodel Builder</title>', '<title>' + vendor + ' xLights .xmodel Builder</title>');
replaceOnce('h1', '<h1>xLights Moving Head .xmodel Builder</h1>', '<h1>' + vendor + ' &mdash; xLights Moving Head .xmodel Builder</h1>');
replaceOnce('subtitle', '<p>Generate a DMX moving-head .xmodel for any quantity of heads (up to 8).</p>', '<p>Generate a DMX moving-head .xmodel for your ' + vendor + ' fixtures, for any quantity of heads (up to 8).</p>');
if (args.url) {
  replaceOnce('about link', '<a class="about-link" href="https://github.com/AGFazio/Moving-Heads#readme" target="_blank" rel="noopener" aria-label="About this tool">About</a>',
    '<a class="about-link" href="' + args.url + '" target="_blank" rel="noopener" aria-label="' + vendor + ' website">' + vendor + '</a>');
}

// 3b. Vendor theme: purple (primary), blue (secondary), gold (highlight). Override with --purple --blue --gold --scale.
const purple = args.purple || '#8b5cf6';
const blue = args.blue || '#3b82f6';
const gold = args.gold || '#fbbf24';
const rgbOf = c => c.replace('#', '').match(/../g).map(h => parseInt(h, 16)).join(',');
const pr = rgbOf(purple), bl = rgbOf(blue), go = rgbOf(gold);
const theme = `
  /* vendor theme */
  body { background: #0b0b1a; color: #e6e8f5; zoom: ${args.scale || 1.2}; }
  header { background: linear-gradient(180deg, #1b1245 0%, #0f1536 55%, #0b0b1a 100%); border-bottom: 3px solid ${gold}; box-shadow: 0 6px 24px rgba(${pr},0.25); padding: 38px 28px 30px; }
  header::before { width: 100%; height: 4px; background: linear-gradient(90deg, ${purple}, ${blue}, ${gold}); top: 0; }
  header::after { width: 90px; height: 3px; background: linear-gradient(90deg, ${purple}, ${blue}, ${gold}); box-shadow: 0 0 12px rgba(${go},0.5); }
  header h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; background: linear-gradient(180deg, #ffffff 0%, ${gold} 100%); -webkit-background-clip: text; background-clip: text; text-shadow: none; }
  header p { color: #b4b9dc; }
  .about-link { color: ${gold}; border-color: rgba(${go},0.6); background: rgba(${go},0.08); font-weight: 600; }
  .about-link:hover { color: #0b0b1a; background: ${gold}; border-color: ${gold}; }
  fieldset { background: #14142b; border: 1px solid #2a2d5a; border-left: 4px solid ${blue}; border-radius: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.45); }
  legend { background: linear-gradient(90deg, ${purple}, ${blue}); color: #ffffff; border: none; border-radius: 4px; letter-spacing: 0.1em; font-weight: 800; }
  label, .help, .field-tip, .chlist-header, .rgbw-cell label { color: #b4b9dc; }
  input[type="text"], input[type="number"], textarea, select { background: #0d0d20; border-color: #33376b; color: #f1f2fb; }
  input[type="text"]:focus, input[type="number"]:focus, textarea:focus, select:focus { border-color: ${blue}; box-shadow: 0 0 0 3px rgba(${bl},0.3); }
  button { background: linear-gradient(180deg, ${purple} 0%, #6d3fe0 100%); color: #ffffff; border: 1px solid ${gold}; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; box-shadow: 0 3px 10px rgba(${pr},0.4); }
  button:hover { filter: brightness(1.15); box-shadow: 0 4px 14px rgba(${go},0.35); }
  button.secondary { background: #20244a; color: #e6e8f5; border: 1px solid #33376b; box-shadow: none; }
  .preset-select { border-color: rgba(${go},0.65); }
  .head-radio { background: #0d0d20; border-color: #33376b; color: #e6e8f5; border-radius: 4px; }
  .head-radio:hover { background: #1b1f45; }
  .head-radio:has(input:checked) { border-color: ${gold}; background: rgba(${pr},0.25); }
  input[type="radio"], input[type="checkbox"] { accent-color: ${args.green || '#22c55e'}; }
  summary, .pane-title, .help-btn { color: ${gold}; }
  pre.preview { background: #0d0d20; border-color: #2a2d5a; }
  .modal-box { background: #14142b; border: 1px solid #2a2d5a; border-top: 4px solid ${gold}; border-radius: 6px; }
  .modal-box h3 { color: ${gold}; text-transform: uppercase; letter-spacing: 0.04em; }
  .modal-box p, .info-modal .modal-box .modal-body, .info-modal .modal-box .modal-body p { color: #d6d9ef; }
  #orientIcon .head-body { fill: ${purple}; }
  #orientIcon .beam { stroke: ${gold}; }
  #orientIcon .ring { fill: #20244a; stroke: #33376b; }
`;
replaceOnce('theme injection point', '</style>', theme + '</style>');

// 4. Preset-only: hide the "Add new Moving Head" option and catalog wording
replaceOnce('fixture-mode radios', '<div style="display:flex; gap:24px; margin-bottom:12px; align-items:flex-start;">', '<div style="display:none;">');
replaceOnce('presets help text', 'Built-in presets are pre-configured Moving Heads kept in a shared catalog. The list grows as new Moving Heads are added.', 'Pre-configured settings for ' + vendor + ' Moving Heads.');
replaceOnce('preset label', 'Load a preset Moving Head &darr;', 'Choose your ' + vendor + ' Moving Head &darr;');

// 5. Welcome dialog
replaceOnce('welcome title', 'Welcome to the xLights Moving Head .xmodel Builder', 'Welcome to the ' + vendor + ' xLights .xmodel Builder');
replaceOnce('welcome intro', 'for any DMX moving-head fixture.</p>', 'for ' + vendor + ' moving-head fixtures.</p>');
replaceRegex('welcome fixture step', /<li>Pick your fixture from the <b>Choose preset<\/b>[^\n]*<\/li>/, '<li>Pick your fixture from the <b>Choose your ' + vendor + ' Moving Head</b> dropdown.</li>');
replaceRegex('welcome footer', /<p>For full details, the channel-type reference[^\n]*<\/p>/, '<p>Questions about your fixtures? Visit ' + vendorLink + '.</p>');

// 6. Numbered steps (only sections visible in preset mode) + instructions link
const steps = ['Fixture', 'Model', 'String Groups', 'Pan motor parameters', 'Tilt motor parameters', 'Output'];
steps.forEach((name, i) => replaceOnce('legend ' + name, '<legend>' + name + '</legend>', '<legend>Step ' + (i + 1) + ' &middot; ' + name + '</legend>'));

const instrFile = 'instructions-' + slug + '.html';
replaceOnce('header open', '  <h1>', '  <a class="about-link" style="right:auto; left:20px;" href="' + instrFile + '" target="_blank" rel="noopener">Instructions</a>\n  <h1>');
replaceRegex('welcome quick start', /<p><b>Quick start:<\/b><\/p>\s*<ol>[\s\S]*?<\/ol>/,
  '<p><b>Quick start:</b></p>\n      <ol>\n' +
  '        <li><b>Step 1:</b> Choose your ' + vendor + ' Moving Head.</li>\n' +
  '        <li><b>Step 2:</b> Set the <b>Quantity of heads</b>.</li>\n' +
  '        <li><b>Step 3:</b> Leave the String Groups as they are (or tick any extras you want).</li>\n' +
  '        <li><b>Step 4:</b> Confirm the <b>Head orientation at rest</b>.</li>\n' +
  '        <li><b>Step 5:</b> Tick <b>Upside Down</b> if the heads are hung upside down.</li>\n' +
  '        <li><b>Step 6:</b> Click <b>Generate and Download xmodel</b>.</li>\n' +
  '        <li>In xLights, <b>delete any existing moving head models and groups</b>, then use the <b>Import</b> icon in Layout to import your <code>.xmodel</code>.</li>\n' +
  '      </ol>\n      <p>Need more detail? Open the <a href="' + instrFile + '" target="_blank" rel="noopener" style="color:' + gold + ';">Instructions</a> page.</p>');

const instr = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${vendor} .xmodel Builder Instructions</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0b1a; color: #e6e8f5; line-height: 1.65; zoom: ${args.scale || 1.2}; }
  header { background: linear-gradient(180deg, #1b1245 0%, #0f1536 55%, #0b0b1a 100%); border-bottom: 3px solid ${gold}; padding: 34px 20px 26px; text-align: center; position: relative; }
  header::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${purple}, ${blue}, ${gold}); }
  h1 { margin: 0; font-size: 30px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; background: linear-gradient(180deg, #fff 0%, ${gold} 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  header p { margin: 8px 0 0; color: #b4b9dc; font-style: italic; }
  .btn { display: inline-block; margin-top: 20px; padding: 16px 40px; font-size: 18px !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(${pr},0.5); background: linear-gradient(180deg, ${purple} 0%, #6d3fe0 100%); color: #fff; border: 1px solid ${gold}; border-radius: 4px; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px; }
  main { max-width: 820px; margin: 0 auto; padding: 26px 20px 50px; }
  .card { background: #14142b; border: 1px solid #2a2d5a; border-left: 4px solid ${blue}; border-radius: 6px; padding: 18px 22px; margin: 0 0 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.45); }
  .tag { display: inline-block; background: linear-gradient(90deg, ${purple}, ${blue}); color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 12px; border-radius: 4px; margin-bottom: 10px; }
  h2 { margin: 0 0 8px; font-size: 18px; color: ${gold}; }
  p { margin: 0 0 10px; color: #d6d9ef; }
  ul, ol { margin: 0 0 10px 20px; padding: 0; color: #d6d9ef; }
  li { margin-bottom: 5px; }
  code { background: rgba(0,0,0,0.35); padding: 1px 6px; border-radius: 3px; font-size: 0.92em; color: #f5e7ff; }
  .warn { border-left-color: ${gold}; background: rgba(${go},0.07); }
  a { color: ${gold}; }
</style>
</head>
<body>
<header>
  <h1>${vendor} Builder Instructions</h1>
  <p>Create xLights moving head models for your ${vendor} fixtures in six steps.</p>
  <a class="btn" href="xmodel-builder-${slug}.html">Open the Builder</a>
</header>
<main>

  <div class="card warn">
    <span class="tag">Before you start</span>
    <h2>Delete your existing moving head models</h2>
    <p><b>In xLights, delete all existing moving head models and groups before importing new ones.</b> Leftovers will conflict with the new import and break the way the heads work. This includes:</p>
    <ul>
      <li>Models named <code>MH1</code>, <code>MH2</code>, &hellip;</li>
      <li>The <code>MH Dimmer</code>, <code>MH Pan</code>, <code>MH Shutter</code> and <code>MH Tilt</code> string groups (and any other <code>MH</code> string groups)</li>
      <li><code>Group - MH ALL</code></li>
    </ul>
    <p>You also need <b>xLights 2026.09 or newer</b>. Earlier versions can't import multi-model <code>.xmodel</code> files.</p>
  </div>

  <div class="card">
    <span class="tag">Step 1</span>
    <h2>Fixture</h2>
    <p>Choose your ${vendor} moving head from the dropdown. Its channel layout, motor settings and colors load automatically. There is nothing else to enter.</p>
  </div>

  <div class="card">
    <span class="tag">Step 2</span>
    <h2>Model</h2>
    <p>Pick the <b>Quantity of heads</b>, from 1 to 8. This is how many heads will be added to your layout. The limit of 8 comes from the xLights <i>Advanced Moving Head</i> effect, which supports at most 8 fixtures at a time.</p>
  </div>

  <div class="card">
    <span class="tag">Step 3</span>
    <h2>String Groups</h2>
    <p>String Groups let you control one function (such as Dimmer) on every head from a single place.</p>
    <ul>
      <li>Leave <b>Dimmer, Shutter, Pan and Tilt</b> checked. They are the most commonly used.</li>
      <li>Tick any extras you want (such as Color, Gobo, Prism, Focus or Frost). Only functions your fixture has are listed.</li>
    </ul>
  </div>

  <div class="card">
    <span class="tag">Step 4</span>
    <h2>Pan motor parameters</h2>
    <ul>
      <li><b>Pan Direction</b> is already set for your fixture. If you want to double-check it, click the <b>?</b> button for the test.</li>
      <li><b>Head orientation at rest</b>: choose which way the head points when powered on, as seen from in front of the stage (Right, Left, Front or Back). The picture rotates to match your choice.</li>
      <li>Options marked <span style="color:#22c55e;">(Recommended Position)</span> suit your fixture's pan direction. Grayed-out options aren't recommended.</li>
    </ul>
  </div>

  <div class="card">
    <span class="tag">Step 5</span>
    <h2>Tilt motor parameters</h2>
    <p>Tick <b>Mount &rarr; Upside Down</b> if your fixtures are hung upside down (for example from a truss or roof). Leave it unticked for heads sitting on the ground.</p>
  </div>

  <div class="card">
    <span class="tag">Step 6</span>
    <h2>Output</h2>
    <p>Click <b>Generate and Download xmodel</b>. A file named like <code>4 heads MH.xmodel</code> is saved to your Downloads folder.</p>
  </div>

  <div class="card">
    <span class="tag">Then, in xLights</span>
    <h2>Import your heads</h2>
    <ol>
      <li>Make sure the old moving head models and groups are deleted (see the top of this page).</li>
      <li>Open the <b>Layout</b> tab and click the <b>Import</b> icon.</li>
      <li>Drag a box on the layout where you want the heads, then choose your <code>.xmodel</code> file from your Downloads folder.</li>
    </ol>
  </div>

</main>
</body>
</html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(path.join(path.dirname(out), instrFile), instr, 'utf8');
console.log('Wrote ' + path.join(path.dirname(out), instrFile));
fs.writeFileSync(out, html, 'utf8');
console.log('Wrote ' + out + ' with ' + presets.length + ' presets:\n  - ' + presets.map(p => p.name).join('\n  - '));
