---
"@zag-js/hotkeys": patch
---

- Fix issue where `isPressed` always returned `false` for bare modifiers. `"shift"`, `"ctrl"`, `"alt"`, `"meta"` and
  `"mod"` now parse as modifier flags instead of regular keys.
- Fix issue where a command registered with `enabled: false` never fired, even after calling `enable()` or
  `setEnabled(id, true)`.
- Fix issue where `subscribe` callers tracking `pressedKeys` received no updates until at least one command was
  registered.
- Fix issue where a command registered with `capture: false` never fired if the store was already listening (e.g. after
  a capture-phase command or a subscriber).
- Fix issue where `HotkeyRecorder.stop()` cleared the previously recorded value when nothing new was recorded.
- Fix issue where `HotkeyRecorder.cancel()` kept a partially recorded value instead of restoring the value from before
  recording started.
- Fix issue where `addScope`, `removeScope` and `toggleScope` did not reset in-progress sequences, unlike `setScope`.
- Fix issue where `getPlatform` never resolved `linux`, so the `linux` entry in the display map was unreachable.
  `formatHotkey("meta+K")` now shows `Super` on Linux instead of `Win`. Android, which reports a Linux platform string,
  still resolves to `windows`.
- Add `normalizeHotkey`, which resolves a hotkey to a canonical string so equivalent hotkeys written differently
  (`mod+k`, `Meta+K`) compare equal. Useful as a stable identity key for a registered hotkey.
- Export the `Platform` type, which `FormatHotkeyOptions.platform` already accepts.
