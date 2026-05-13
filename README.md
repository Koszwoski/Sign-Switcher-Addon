# Sign-Switcher Addon for BYOB

Wanders the world, breaks signs, and replaces them with random text from your preset list. Only replaces signs whose current text does not already match a preset.

## Installation

1. Copy `sign-switcher.mjs` and `sign-switcher-presets.mjs` into BYOB's `src/addons/` folder.
2. Add `"sign-switcher"` to the `AVAILABLE` array in `src/addons/index.mjs`.
3. In your BYOB directory, install the pathfinding dependency:
   ```bash
   pnpm add mineflayer-pathfinder
   ```
   (Skip this step if BYOB already has `mineflayer-pathfinder` in its `package.json`.)
4. Restart the bot and enable with `.enable sign-switcher` in Discord.

## Discord Commands

All commands go through the `.addon` system:

| Command | Description |
|---|---|
| `.addon sign-switcher add <name> <l1> <l2> <l3> <l4>` | Add or overwrite a preset |
| `.addon sign-switcher remove <name>` | Remove a preset |
| `.addon sign-switcher list` | List all preset names |

### Example

```
.addon sign-switcher add Greeting "Hello!" "Welcome" "" ""
.addon sign-switcher add Warning "Keep out" "" "" ""
.addon sign-switcher list
```

## How It Works

1. The bot wanders randomly within ±100 blocks.
2. Every second it scans for signs within 64 blocks.
3. Signs already matching a preset are skipped (loop prevention).
4. When a matching sign is found: navigate → break → collect → place → write.
5. A random preset is chosen for each replaced sign.

## Config

| Key | Default | Description |
|---|---|---|
| `scanIntervalTicks` | `20` | Ticks between sign scans (50ms each, 20 = 1 second) |
| `wanderRange` | `100` | Max wander distance in blocks |
| `writeDelayMs` | `250` | Delay after placing before writing text |

## Notes

- Only floor-standing signs are supported (wall-mounted signs are skipped).
- Presets are stored in `data/sign-switcher-presets.json` in the BYOB working directory and persist across restarts.
- The addon must be active (bot running + `.enable sign-switcher`) before `.addon sign-switcher` commands work.
