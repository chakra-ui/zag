# @zag-js/date-input

## 2.0.0-next.0
## 1.42.0

### Patch Changes

- [`ac7a81a`](https://github.com/chakra-ui/zag/commit/ac7a81a3fcae86500cdf15703118318570f976d5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Allow typing dates using the locale's native numerals (e.g.
  Arabic-Indic `٠-٩`, Devanagari `०-९`) in addition to ASCII digits. Latin-locale behavior is unchanged.

- [#3190](https://github.com/chakra-ui/zag/pull/3190)
  [`808c5ef`](https://github.com/chakra-ui/zag/commit/808c5ef0e5ff273f786a1d48f054699cf3b67d80) Thanks
  [@Adebesin-Cell](https://github.com/Adebesin-Cell)! - Fix timezone-naive values (`CalendarDate`/`CalendarDateTime`)
  being shifted by the viewer's local UTC offset when a custom `formatter` without an explicit `timeZone` is provided.
  Typing `0` into the hour segment of a time-only input previously committed/displayed `02` at UTC+2 or `09` at UTC+9
  instead of `0`.

  The instant fed to the formatter is now built using the formatter's own resolved time zone, so a wall-clock value
  round-trips unshifted regardless of the viewer's locale. `ZonedDateTime` values (which carry an absolute instant) are
  unaffected.

- Updated dependencies [[`ac7a81a`](https://github.com/chakra-ui/zag/commit/ac7a81a3fcae86500cdf15703118318570f976d5)]:
  - @zag-js/date-utils@1.42.0
  - @zag-js/anatomy@1.42.0
  - @zag-js/core@1.42.0
  - @zag-js/types@1.42.0
  - @zag-js/utils@1.42.0
  - @zag-js/dom-query@1.42.0
  - @zag-js/live-region@1.42.0

## 1.41.2

### Patch Changes

- Updated dependencies [[`5820feb`](https://github.com/chakra-ui/zag/commit/5820febc81934f3d8d17e01f085aafe6dd81fc73)]:
  - @zag-js/anatomy@2.0.0-next.0
  - @zag-js/types@2.0.0-next.0
  - @zag-js/dom-query@2.0.0-next.0
  - @zag-js/core@2.0.0-next.0
  - @zag-js/utils@2.0.0-next.0
  - @zag-js/date-utils@2.0.0-next.0
  - @zag-js/live-region@2.0.0-next.0

## 1.41.0

### Minor Changes

- [`43c5c9b`](https://github.com/chakra-ui/zag/commit/43c5c9b5b5f12866431cdc4f94966b7d1f677f47) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix time-only formatters (no `year` segment) never firing
  `onValueChange` — `era` is now only required when `year` is present.
  - Fix `setSegmentValue` reading stale `displayValues`. `updateSegmentValue` returns the new `IncompleteDate` directly
    so the commit check uses the fresh value.
  - Fix `dayPeriod` (AM/PM) arrow up/down not updating the visible segment when `hourCycle` changes at runtime —
    `displayValues` now re-sync to the new hour cycle while preserving in-progress edits.
  - Fix typing "A" / "P" on the `dayPeriod` segment not updating the visible AM/PM. The typing path was writing `12` for
    PM while every other code path uses `1`, so the display silently stayed on AM.
  - Add `hideTimeZone` prop. The `timeZoneName` segment now renders automatically when the value is a `ZonedDateTime`,
    and can be hidden via `hideTimeZone: true`.
  - Arrow navigation and auto-advance after typing now reach read-only focusable segments (e.g. `timeZoneName`). Typing
    the final editable segment (e.g. "P" on `dayPeriod`) advances focus to the trailing read-only segment instead of
    staying put.

### Patch Changes

- [`6dbc33a`](https://github.com/chakra-ui/zag/commit/6dbc33aceee09aba5cfe036a128b9efc76a442d0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix date input min/max handling to preserve entered segments while
  editing. Values are now clamped segment-by-segment on blur, so `06/15/1999` with min `2000-01-01` becomes `06/15/2000`
  instead of snapping to `01/01/2000`.

  Add `constrainSegments` to `@zag-js/date-utils` for segment-wise min/max clamping.

- [#3109](https://github.com/chakra-ui/zag/pull/3109)
  [`ab36b5f`](https://github.com/chakra-ui/zag/commit/ab36b5fa6db52f59edfbf65a448de3def7fdb562) Thanks
  [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix range mode keyboard navigation so `ArrowRight`
  moves from the last segment of the start date to the first segment of the end date.

- [`8715c64`](https://github.com/chakra-ui/zag/commit/8715c64306f62219e53c9cdbd3695607d50406a4) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where the date input was not writable in locales whose
  date format separator contains more than one character (e.g. `cs-CZ`, `sk-SK`, `hu-HU`, `ko-KR` which use `". "`)
- Updated dependencies [[`13cd5d5`](https://github.com/chakra-ui/zag/commit/13cd5d5141022a7212987bd7ccfd9d0999cb905f),
  [`6dbc33a`](https://github.com/chakra-ui/zag/commit/6dbc33aceee09aba5cfe036a128b9efc76a442d0),
  [`8715c64`](https://github.com/chakra-ui/zag/commit/8715c64306f62219e53c9cdbd3695607d50406a4),
  [`13cd5d5`](https://github.com/chakra-ui/zag/commit/13cd5d5141022a7212987bd7ccfd9d0999cb905f),
  [`84b9e2b`](https://github.com/chakra-ui/zag/commit/84b9e2bdcbdc4e9404da94f13a663e5ff492be28)]:
  - @zag-js/core@1.41.0
  - @zag-js/date-utils@1.41.0
  - @zag-js/dom-query@1.41.0
  - @zag-js/anatomy@1.41.0
  - @zag-js/types@1.41.0
  - @zag-js/utils@1.41.0
  - @zag-js/live-region@1.41.0

## 1.40.0

### Patch Changes

- [`5e4b4da`](https://github.com/chakra-ui/zag/commit/5e4b4da2bd3c00efdec076715c91c8e24efa135b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Defer min/max constraint until segment is fully typed or on blur
  to prevent resetting other segments mid-keystroke.

- Updated dependencies [[`00809cd`](https://github.com/chakra-ui/zag/commit/00809cd3adeb17d4c10efd5a91d87b903d13d05b),
  [`8181b98`](https://github.com/chakra-ui/zag/commit/8181b98c75305a037958eedf42cd13c95a6b439c)]:
  - @zag-js/date-utils@1.40.0
  - @zag-js/anatomy@1.40.0
  - @zag-js/core@1.40.0
  - @zag-js/types@1.40.0
  - @zag-js/utils@1.40.0
  - @zag-js/dom-query@1.40.0
  - @zag-js/live-region@1.40.0

## 1.39.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.39.1
  - @zag-js/core@1.39.1
  - @zag-js/types@1.39.1
  - @zag-js/utils@1.39.1
  - @zag-js/date-utils@1.39.1
  - @zag-js/dom-query@1.39.1
  - @zag-js/live-region@1.39.1

## 1.39.0

### Patch Changes

- [`fb4b868`](https://github.com/chakra-ui/zag/commit/fb4b868731188abe52414da5b4f2a92c41b6a7eb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix `event.nativeEvent.isComposing` to use framework-agnostic
  `isComposingEvent` utility

- Updated dependencies []:
  - @zag-js/anatomy@1.39.0
  - @zag-js/core@1.39.0
  - @zag-js/types@1.39.0
  - @zag-js/utils@1.39.0
  - @zag-js/date-utils@1.39.0
  - @zag-js/dom-query@1.39.0
  - @zag-js/live-region@1.39.0

## 1.38.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.38.2
  - @zag-js/core@1.38.2
  - @zag-js/types@1.38.2
  - @zag-js/utils@1.38.2
  - @zag-js/date-utils@1.38.2
  - @zag-js/dom-query@1.38.2
  - @zag-js/live-region@1.38.2

## 1.38.1

### Patch Changes

- Updated dependencies [[`2b4818c`](https://github.com/chakra-ui/zag/commit/2b4818c3b82ed1ca8ffd2cb44110a4a195ac68d6)]:
  - @zag-js/core@1.38.1
  - @zag-js/anatomy@1.38.1
  - @zag-js/types@1.38.1
  - @zag-js/utils@1.38.1
  - @zag-js/date-utils@1.38.1
  - @zag-js/dom-query@1.38.1
  - @zag-js/live-region@1.38.1

## 1.38.0

### Patch Changes

- Updated dependencies [[`4a395ad`](https://github.com/chakra-ui/zag/commit/4a395adb51b4ef1516acc7d5b03f78fa5130267c)]:
  - @zag-js/dom-query@1.38.0
  - @zag-js/core@1.38.0
  - @zag-js/anatomy@1.38.0
  - @zag-js/types@1.38.0
  - @zag-js/utils@1.38.0
  - @zag-js/date-utils@1.38.0
  - @zag-js/live-region@1.38.0

## 1.37.0

### Minor Changes

- [`1d1dab1`](https://github.com/chakra-ui/zag/commit/1d1dab17ce8ff23ac0740104c0383014e0f3e29f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add paste support for ISO 8601 date strings
  - Add `api.focus()` method for programmatic focus
  - Add `createCalendar` prop for non-Gregorian calendar systems (e.g., Buddhist, Persian)
  - Add `isDateUnavailable` prop to mark specific dates as invalid

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.37.0
  - @zag-js/core@1.37.0
  - @zag-js/types@1.37.0
  - @zag-js/utils@1.37.0
  - @zag-js/date-utils@1.37.0
  - @zag-js/dom-query@1.37.0
  - @zag-js/live-region@1.37.0

## 1.36.0

### Patch Changes

- [#3013](https://github.com/chakra-ui/zag/pull/3013)
  [`71694d4`](https://github.com/chakra-ui/zag/commit/71694d4a66fa60cc85a86f8900b85bf874d36c43) Thanks
  [@isBatak](https://github.com/isBatak)! - Improve Focus Management

- Updated dependencies [[`7edfd5e`](https://github.com/chakra-ui/zag/commit/7edfd5e6ffa0bddde524c9bd43aa157f3fb76b72)]:
  - @zag-js/dom-query@1.36.0
  - @zag-js/core@1.36.0
  - @zag-js/anatomy@1.36.0
  - @zag-js/types@1.36.0
  - @zag-js/utils@1.36.0
  - @zag-js/date-utils@1.36.0
  - @zag-js/live-region@1.36.0

## 1.35.3

### Patch Changes

- [#2671](https://github.com/chakra-ui/zag/pull/2671)
  [`8d85905`](https://github.com/chakra-ui/zag/commit/8d85905530a7a34b0194bd971accf6c2a31062e9) Thanks
  [@isBatak](https://github.com/isBatak)! - Initial release of date input machine

- Updated dependencies []:
  - @zag-js/anatomy@1.35.3
  - @zag-js/core@1.35.3
  - @zag-js/types@1.35.3
  - @zag-js/utils@1.35.3
  - @zag-js/date-utils@1.35.3
  - @zag-js/dom-query@1.35.3
  - @zag-js/live-region@1.35.3
