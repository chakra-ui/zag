# @zag-js/date-utils

## 1.26.1

## 1.26.0

## 1.25.0

## 1.24.2

### Patch Changes

- [#2717](https://github.com/chakra-ui/zag/pull/2717)
  [`05bf37a`](https://github.com/chakra-ui/zag/commit/05bf37aeb332f3666aa8cb4d586481b7a60a9374) Thanks
  [@colinlienard](https://github.com/colinlienard)! - Fix issue where quarter presets returns incorrect date

- [`9181889`](https://github.com/chakra-ui/zag/commit/91818897e1e1e95b5ebc8b5ea9f73a66c2f96ed0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where year range picker doesn't show the hovered range

## 1.24.1

## 1.24.0

## 1.23.0

## 1.22.1

## 1.22.0

## 1.21.9

## 1.21.8

## 1.21.7

## 1.21.6

## 1.21.5

## 1.21.4

## 1.21.3

## 1.21.2

## 1.21.1

## 1.21.0

## 1.20.1

## 1.20.0

### Patch Changes

- [`78dd066`](https://github.com/chakra-ui/zag/commit/78dd066b2feda69d1f759e46b3cd099d2d2560e8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix date comparison issues when time components are involved

  This change resolves critical issues with date comparison operations when different date types (`CalendarDate`,
  `CalendarDateTime`, `ZonedDateTime`) are mixed, particularly in scenarios involving time components.
  - Convert `now(timeZone)` result to `CalendarDate` to ensure consistent date types without time components across all
    date range preset operations
  - Update `constrainValue` function to normalize all input dates to `CalendarDate` before comparison, preventing
    time-component comparison issues
  - Remove redundant date type conversion in `getMonthFormatter` for cleaner, more efficient code

## 1.19.0

## 1.18.5

## 1.18.4

## 1.18.3

## 1.18.2

## 1.18.1

## 1.18.0

## 1.17.4

## 1.17.3

## 1.17.2

## 1.17.1

## 1.17.0

## 1.16.0

## 1.15.7

## 1.15.6

## 1.15.5

## 1.15.4

## 1.15.3

## 1.15.2

## 1.15.1

## 1.15.0

## 1.14.0

## 1.13.1

## 1.13.0

## 1.12.4

## 1.12.3

## 1.12.2

## 1.12.1

## 1.12.0

## 1.11.0

## 1.10.0

## 1.9.3

## 1.9.2

## 1.9.1

## 1.9.0

## 1.8.2

## 1.8.1

## 1.8.0

## 1.7.0

## 1.6.2

## 1.6.1

## 1.6.0

## 1.5.0

## 1.4.2

## 1.4.1

## 1.4.0

## 1.3.3

## 1.3.2

## 1.3.1

## 1.3.0

### Patch Changes

- [`4aae066`](https://github.com/chakra-ui/zag/commit/4aae066082dd5495493273583e7316d512740cde) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for `api.getViewProps`.
  - Add `visibleRangeText` property to `api.offset()` return value.

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.2

## 1.0.1

## 1.0.0

## 0.82.2

## 0.82.1

## 0.82.0

## 0.81.2

## 0.81.1

## 0.81.0

## 0.80.0

## 0.79.3

## 0.79.2

## 0.79.1

## 0.79.0

## 0.78.3

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.1

## 0.77.0

## 0.76.0

## 0.75.0

## 0.74.2

## 0.74.1

### Patch Changes

## 0.74.0

## 0.73.1

## 0.73.0

## 0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

## 0.70.0

## 0.69.0

## 0.68.1

### Patch Changes

- [#1845](https://github.com/chakra-ui/zag/pull/1845)
  [`16cde4d`](https://github.com/chakra-ui/zag/commit/16cde4dcf48a6e9bf300edc23c115ff09534ffd2) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix issue where partial YY format in date string was not parsed
  correctly.

## 0.68.0

## 0.67.0

### Patch Changes

- [`b2e9a6e`](https://github.com/chakra-ui/zag/commit/b2e9a6e8255799b164a2ec26b813159167a714ca) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `getWeekDays` has incoherent behavior when both
  locale and `startOfWeekProp` are set

## 0.66.1

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.0

## 0.62.1

## 0.62.0

## 0.61.1

## 0.61.0

## 0.60.0

## 0.59.0

## 0.58.3

## 0.58.2

## 0.58.1

## 0.58.0

## 0.57.0

## 0.56.1

## 0.56.0

## 0.55.0

## 0.54.0

## 0.53.0

## 0.52.0

## 0.51.2

## 0.51.1

## 0.51.0

## 0.50.0

## 0.49.0

## 0.48.0

## 0.47.0

## 0.46.0

## 0.45.0

## 0.44.0

## 0.43.0

## 0.42.0

## 0.41.0

### Minor Changes

- [`d19851a`](https://github.com/chakra-ui/zag/commit/d19851adf36ee291b8e3284def27700864304a50) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `formatDate` and `formatList` functions that use
  the underlying `Intl.*` implementations

## 0.40.0

## 0.39.0

## 0.38.1

## 0.38.0

## 0.37.3

## 0.37.2

## 0.37.1

## 0.37.0

## 0.36.3

## 0.36.2

## 0.36.1

## 0.36.0

## 0.35.0

### Patch Changes

- [#1209](https://github.com/chakra-ui/zag/pull/1209)
  [`2b3edb1`](https://github.com/chakra-ui/zag/commit/2b3edb14d2e892ea70e289b54ba83fcd71e1bcab) Thanks
  [@zhengkyl](https://github.com/zhengkyl)! - Fix issue where date picker does not show correct number of weeks when
  `startOfWeek` is set

## 0.34.0

## 0.33.2

## 0.33.1

## 0.33.0

## 0.32.1

## 0.32.0

## 0.31.1

## 0.31.0

## 0.30.0

## 0.29.0

## 0.28.1

## 0.28.0

## 0.27.1

## 0.27.0

## 0.26.0

## 0.25.0

## 0.24.0

## 0.23.0

## 0.22.0

## 0.21.0

## 0.20.0

### Patch Changes

- [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove toggle machine

## 0.19.1

## 0.19.0

## 0.18.0

## 0.17.0

## 0.16.0

## 0.15.0

## 0.14.0

## 0.13.0

## 0.12.0

## 0.11.2

## 0.11.1

## 0.11.0

### Patch Changes

- [`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rebuild all packages using tsup

## 0.10.5

## 0.10.4

## 0.10.3

### Patch Changes

- [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Use vite to build packages

## 0.10.2

## 0.10.1

## 0.10.0

## 0.9.2

## 0.9.1

### Patch Changes

- [`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force release every package to fix regression

## 0.9.0

### Patch Changes

- [`9d7c3bbe`](https://github.com/chakra-ui/zag/commit/9d7c3bbed06e44897a7fc2bfc16cd71ba9fc26df) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove `null` from getDaysInWeek

## 0.5.0

### Patch Changes

- [`7f4b6e45`](https://github.com/chakra-ui/zag/commit/7f4b6e4566f8015e9d258852330d3f4d32bc5757) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor to use `CalendarDateTime` instead of `CalendarDate` to
  match the native date functionality.
  - Improve input event handling to only allow valid characters and separators.

## 0.1.4

### Patch Changes

- [`7f9c16a4`](https://github.com/chakra-ui/zag/commit/7f9c16a4257b9a022c3bfc9d736108b1d0f55a2e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `formatDate` function to allow formatting a date to specific
  string format (e.g. `YYYY-MM-DD`, `DD/MM/YYYY`)

## 0.1.3

### Patch Changes

- [#565](https://github.com/chakra-ui/zag/pull/565)
  [`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Simplify date picker utilities and machine

- [`fefa5098`](https://github.com/chakra-ui/zag/commit/fefa5098f400ee6b04e5636c8b0b016dca5b2360) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump `@internationalized/date` dependency

## 0.1.2

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

## 0.1.1

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

## 0.1.0

### Minor Changes

- [#467](https://github.com/chakra-ui/zag/pull/467)
  [`de1af599`](https://github.com/chakra-ui/zag/commit/de1af599a515d2b0d09ee7c5d92835088ae05201) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release
