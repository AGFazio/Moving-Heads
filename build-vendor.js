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
const vendorLink = args.url ? '<a href="' + args.url + '" target="_blank" rel="noopener" style="color:#cba6f7;">' + vendor + '</a>' : vendor;

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

// 4. Preset-only: hide the "Add new Moving Head" option and catalog wording
replaceOnce('fixture-mode radios', '<div style="display:flex; gap:24px; margin-bottom:12px; align-items:flex-start;">', '<div style="display:none;">');
replaceOnce('presets help text', 'Built-in presets are pre-configured Moving Heads kept in a shared catalog. The list grows as new Moving Heads are added.', 'Pre-configured settings for ' + vendor + ' Moving Heads.');
replaceOnce('preset label', 'Load a preset Moving Head &darr;', 'Choose your ' + vendor + ' Moving Head &darr;');

// 5. Welcome dialog
replaceOnce('welcome title', 'Welcome to the xLights Moving Head .xmodel Builder', 'Welcome to the ' + vendor + ' xLights .xmodel Builder');
replaceOnce('welcome intro', 'for any DMX moving-head fixture.</p>', 'for ' + vendor + ' moving-head fixtures.</p>');
replaceRegex('welcome fixture step', /<li>Pick your fixture from the <b>Choose preset<\/b>[^\n]*<\/li>/, '<li>Pick your fixture from the <b>Choose your ' + vendor + ' Moving Head</b> dropdown.</li>');
replaceRegex('welcome footer', /<p>For full details, the channel-type reference[^\n]*<\/p>/, '<p>Questions about your fixtures? Visit ' + vendorLink + '.</p>');

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, 'utf8');
console.log('Wrote ' + out + ' with ' + presets.length + ' presets:\n  - ' + presets.map(p => p.name).join('\n  - '));
