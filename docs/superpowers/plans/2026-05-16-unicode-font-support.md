# Unicode Font Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make sign-switcher write all sign lines with `minecraft:uniform` so users can store and display any Unicode fancy text (e.g. `𝔽𝕠𝕟𝕥 ℂ𝕙𝕒𝕟𝕘𝕖𝕣`) in presets.

**Architecture:** Extract a pure `toJsonLines(lines)` helper into `sign-switcher-presets.mjs` that wraps each line in a JSON text component with `minecraft:uniform`. Import and call it in `runPipeline` just before `bot.updateSign`. No changes to the preset data format, Discord commands, or loop prevention logic.

**Tech Stack:** Node.js ESM, mineflayer (`bot.updateSign`), `node:test`

---

## File Map

| File | Change |
|---|---|
| `sign-switcher-presets.mjs` | Add `toJsonLines(lines)` export |
| `sign-switcher.mjs` | Import `toJsonLines`, use it in `runPipeline` |
| `test/presets.test.mjs` | Add 3 tests for `toJsonLines` |

---

### Task 1: Add and test `toJsonLines` in the presets module

**Files:**
- Modify: `sign-switcher-presets.mjs`
- Modify: `test/presets.test.mjs`

- [ ] **Step 1: Write the failing tests**

Append to `test/presets.test.mjs`:

```js
import { loadPresets, savePresets, matchesAnyPreset, getRandomPreset, toJsonLines } from '../sign-switcher-presets.mjs';

// (update the existing import line at the top of the file to include toJsonLines)
```

Then append these three test cases at the bottom of `test/presets.test.mjs`:

```js
test('toJsonLines wraps each line in a JSON text component with minecraft:uniform', () => {
  const result = toJsonLines(['Hello', 'World', '', '']);
  assert.deepEqual(result, [
    '{"text":"Hello","font":"minecraft:uniform"}',
    '{"text":"World","font":"minecraft:uniform"}',
    '{"text":"","font":"minecraft:uniform"}',
    '{"text":"","font":"minecraft:uniform"}',
  ]);
});

test('toJsonLines handles Unicode fancy text', () => {
  const result = toJsonLines(['𝔽𝕠𝕟𝕥', 'ℂ𝕙𝕒𝕟𝕘𝕖𝕣', '', '']);
  assert.equal(result[0], '{"text":"𝔽𝕠𝕟𝕥","font":"minecraft:uniform"}');
  assert.equal(result[1], '{"text":"ℂ𝕙𝕒𝕟𝕘𝕖𝕣","font":"minecraft:uniform"}');
});

test('toJsonLines returns an array of the same length as input', () => {
  assert.equal(toJsonLines(['a', 'b', 'c', 'd']).length, 4);
  assert.equal(toJsonLines([]).length, 0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /tmp/sign-switcher-addon && node --test test/presets.test.mjs
```

Expected: 3 new tests fail with `SyntaxError` or `TypeError: toJsonLines is not a function`.

- [ ] **Step 3: Implement `toJsonLines` in `sign-switcher-presets.mjs`**

Append to the bottom of `sign-switcher-presets.mjs`:

```js
export function toJsonLines(lines) {
  return lines.map((line) => JSON.stringify({ text: line, font: 'minecraft:uniform' }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /tmp/sign-switcher-addon && node --test test/presets.test.mjs
```

Expected: all 13 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd /tmp/sign-switcher-addon
git add sign-switcher-presets.mjs test/presets.test.mjs
git commit -m "feat: add toJsonLines helper for unicode sign writing"
```

---

### Task 2: Use `toJsonLines` in `runPipeline`

**Files:**
- Modify: `sign-switcher.mjs:4-8` (import block), `sign-switcher.mjs:150-154` (sign write in runPipeline)

- [ ] **Step 1: Add `toJsonLines` to the import in `sign-switcher.mjs`**

Find the existing import at the top of `sign-switcher.mjs`:

```js
import {
  loadPresets,
  savePresets,
  matchesAnyPreset,
  getRandomPreset,
} from './sign-switcher-presets.mjs';
```

Replace it with:

```js
import {
  loadPresets,
  savePresets,
  matchesAnyPreset,
  getRandomPreset,
  toJsonLines,
} from './sign-switcher-presets.mjs';
```

- [ ] **Step 2: Use `toJsonLines` when writing the sign in `runPipeline`**

Find this block in `runPipeline` (around line 150):

```js
      const preset = getRandomPreset(localPresets);
      if (preset) {
        await bot.updateSign(placedSign, preset, true);
        log(`[sign-switcher] replaced sign at ${targetPos}`);
      }
```

Replace it with:

```js
      const preset = getRandomPreset(localPresets);
      if (preset) {
        await bot.updateSign(placedSign, toJsonLines(preset), true);
        log(`[sign-switcher] replaced sign at ${targetPos}`);
      }
```

- [ ] **Step 3: Run the test suite to confirm nothing is broken**

```bash
cd /tmp/sign-switcher-addon && node --test test/presets.test.mjs
```

Expected: all 13 tests pass.

- [ ] **Step 4: Commit**

```bash
cd /tmp/sign-switcher-addon
git add sign-switcher.mjs
git commit -m "feat: write signs with minecraft:uniform to support unicode text"
```

---

### Task 3: Push to GitHub

- [ ] **Step 1: Push**

```bash
cd /tmp/sign-switcher-addon && git push
```

- [ ] **Step 2: Verify on GitHub**

Open https://github.com/Koszwoski/Sign-Switcher-Addon and confirm the two new commits appear on `main`.
