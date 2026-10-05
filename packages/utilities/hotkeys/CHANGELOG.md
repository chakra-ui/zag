# @zag-js/hotkeys

## 1.45.0

### Patch Changes

- [#3351](https://github.com/chakra-ui/zag/pull/3351)
  [`ef6b822`](https://github.com/chakra-ui/zag/commit/ef6b822e5658c1a278cda574acc87a6f8efb0312) Thanks
  [@CrazyBucket](https://github.com/CrazyBucket)! - Fix an unhandled `TypeError` when a `keyup` event without a valid
  `key` is dispatched at `document`. Events without a string `key` are now ignored instead of crashing the handler.
- Updated dependencies [[`cfb5874`](https://github.com/chakra-ui/zag/commit/cfb5874ed6b1b3128f308ba47aa445d13fe5c631)]:
  - @zag-js/dom-query@1.45.0

## 1.44.0

### Patch Changes

- [`99e1175`](https://github.com/chakra-ui/zag/commit/99e1175fdd87241fc2c21d3cd90dc04bcfb309b3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Export `getPlatform`, which resolves the current platform to
  `"mac" | "windows" | "linux"`, useful when formatting hotkeys for display. Also export the `SequenceStep` type, the
  element type of `ParsedHotkey.sequenceSteps`.
- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`de9aeaa`](https://github.com/chakra-ui/zag/commit/de9aeaaf89ab8a6cc8e693fb068870a6f3d55205)]:
  - @zag-js/dom-query@1.44.0

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
