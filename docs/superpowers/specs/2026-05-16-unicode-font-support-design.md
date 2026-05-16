# Unicode Font Support — Design Spec

**Date:** 2026-05-16  
**Status:** Approved

## Problem

`bot.updateSign` currently writes plain strings using Minecraft's default font, which does not support extended Unicode characters. Users cannot write fancy Unicode text (e.g. `𝔽𝕠𝕟𝕥 ℂ𝕙𝕒𝕟𝕘𝕖𝕣`) on signs.

## Goal

Allow presets to contain any Unicode text generated from online tools (e.g. double-struck, bold, italic). No changes to the preset data model or Discord commands — the only change is how text is written to the sign.

## Design

### What changes

In `runPipeline` (`sign-switcher.mjs`), instead of passing plain strings to `bot.updateSign`, wrap each line in a JSON text component with `minecraft:uniform`:

```js
const jsonLines = preset.map((line) =>
  JSON.stringify({ text: line, font: 'minecraft:uniform' })
);
await bot.updateSign(placedSign, jsonLines, true);
```

`minecraft:uniform` (Unifont) covers the full Unicode BMP, so any fancy Unicode text from online generators will render correctly.

### What does NOT change

- Preset format stays `string[]` — no new fields
- `add`, `remove`, `list` commands are unchanged
- `matchesAnyPreset` loop prevention is unchanged (compares plain text, which is still stored as-is)
- `sign-switcher-presets.mjs` is unchanged

### Loop prevention note

The sign text cache parses `{"text":"…"}` and extracts `.text` — so the plain text comparison in `matchesAnyPreset` continues to work correctly even after this change.

## Out of scope

- Per-line or per-preset Minecraft font selection (`minecraft:alt`, `minecraft:illageralt`, etc.)
- Automatic text transformation (converting ASCII → double-struck on the fly)
- Backwards compatibility with old presets (user will re-add presets as needed)
