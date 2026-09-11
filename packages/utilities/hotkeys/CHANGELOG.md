# @zag-js/hotkeys

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- [`99e1175`](https://github.com/chakra-ui/zag/commit/99e1175fdd87241fc2c21d3cd90dc04bcfb309b3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Export `getPlatform`, which resolves the current platform to
  `"mac" | "windows" | "linux"`, useful when formatting hotkeys for display. Also export the `SequenceStep` type, the
  element type of `ParsedHotkey.sequenceSteps`.
- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2

## 2.0.0-next.1

## 2.0.0-next.0

## 1.43.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/dom-query@1.43.3

## 1.43.2

### Patch Changes

- [`c3ec2ca`](https://github.com/chakra-ui/zag/commit/c3ec2cac00027e85018bdf40eecee7625156d433) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add `target` option to hotkey commands for scoping a command to
  a DOM subtree. Accepts an element or a function returning one (resolved on every event, so late-mounted elements
  work). The command only fires when the event originates within the target. Targeted commands take priority over global
  ones on the same hotkey, and the same hotkey registered on different targets is no longer reported as a conflict.

  ```ts
  store.register({
    id: "grid.down",
    hotkey: "ArrowDown",
    action: moveDown,
    options: { target: () => gridEl },
  })
  ```

  - Add Linux platform detection. `formatHotkey` with `platform: "auto"` now resolves `linux` on Linux (formatting
    `Meta` as `Super`) instead of falling back to `windows`.

- [`c3ec2ca`](https://github.com/chakra-ui/zag/commit/c3ec2cac00027e85018bdf40eecee7625156d433) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where `isPressed` always returned `false` for bare
  modifiers. `"shift"`, `"ctrl"`, `"alt"`, `"meta"` and `"mod"` now parse as modifier flags instead of regular keys.
  - Fix issue where a command registered with `enabled: false` never fired, even after calling `enable()` or
    `setEnabled(id, true)`.
  - Fix issue where `subscribe` callers tracking `pressedKeys` received no updates until at least one command was
    registered.
  - Fix issue where a command registered with `capture: false` never fired if the store was already listening (e.g.
    after a capture-phase command or a subscriber).
  - Fix issue where `HotkeyRecorder.stop()` cleared the previously recorded value when nothing new was recorded.
  - Fix issue where `HotkeyRecorder.cancel()` kept a partially recorded value instead of restoring the value from before
    recording started.
  - Fix issue where `addScope`, `removeScope` and `toggleScope` did not reset in-progress sequences, unlike `setScope`.
  - Fix issue where `getPlatform` never resolved `linux`, so the `linux` entry in the display map was unreachable.
    `formatHotkey("meta+K")` now shows `Super` on Linux instead of `Win`. Android, which reports a Linux platform
    string, still resolves to `windows`.
  - Add `normalizeHotkey`, which resolves a hotkey to a canonical string so equivalent hotkeys written differently
    (`mod+k`, `Meta+K`) compare equal. Useful as a stable identity key for a registered hotkey.
  - Export the `Platform` type, which `FormatHotkeyOptions.platform` already accepts.
- Updated dependencies []:
  - @zag-js/dom-query@1.43.2

## 1.43.1

## 1.43.0

## 1.42.0

## 1.41.2

## 1.41.1

## 1.41.0

## 1.40.0

## 1.39.1

## 1.39.0

## 1.38.2

## 1.38.1

## 1.38.0

## 1.37.0

## 1.36.0

## 1.35.3

## 1.35.2

## 1.35.1

## 1.35.0

## 1.34.1

## 1.34.0

## 1.33.1

## 1.33.0

## 1.32.0

## 1.31.1

## 1.31.0

## 1.30.0

## 1.29.1

## 1.29.0

## 1.28.0

## 1.27.1

## 1.27.0

## 1.26.5

## 1.26.4

## 1.26.3

## 1.26.2

## 1.26.1

## 1.26.0

## 1.25.0
