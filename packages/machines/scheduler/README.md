# @zag-js/scheduler

Core logic for the scheduler widget implemented as a state machine

Headless calendar / time-grid machine. It emits render data — visible days, hour rows, event positions, drag overlays,
localized labels — and you own the markup and styles.

## Features

- Day, week, month, year, agenda and timeline views
- Resource scheduling — split each day into per-resource lanes, or one lane per row in timeline view
- Drag to move, resize from either edge, drag-select a slot range, with constraint hooks per event
- Drop events in from outside the scheduler
- Native RFC5545 recurrence (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY`, `BYMONTHDAY`, `exdate`), with an escape
  hatch for anything beyond it
- Overlap layout and conflict detection, scoped per resource
- Keyboard navigation and an ARIA `grid` structure
- Locale-, time-zone- and RTL-aware via `Intl.DateTimeFormat` and logical CSS properties

## Installation

```sh
yarn add @zag-js/scheduler
# or
npm i @zag-js/scheduler
```

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).
