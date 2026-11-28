---
"@zag-js/utils": major
---

**Breaking:** Fold the utility packages into `@zag-js/utils` entrypoints. The old packages are removed.

| Removed package                                           | Import from               |
| --------------------------------------------------------- | ------------------------- |
| `@zag-js/color-utils`                                     | `@zag-js/utils/color`     |
| `@zag-js/date-utils`                                      | `@zag-js/utils/date`      |
| `@zag-js/file-utils`                                      | `@zag-js/utils/file`      |
| `@zag-js/i18n-utils`                                      | `@zag-js/utils/i18n`      |
| `@zag-js/fuzzy`, `@zag-js/highlight-word`, `createFilter` | `@zag-js/utils/search`    |
| `@zag-js/rect-utils`                                      | `@zag-js/utils/geometry`  |
| `@zag-js/json-tree-utils`                                 | `@zag-js/utils/json-tree` |

```diff
- import { parseColor } from "@zag-js/color-utils"
+ import { parseColor } from "@zag-js/utils/color"
```

`@internationalized/date` is an optional peer dependency, needed only for `@zag-js/utils/date`. The root also has
entrypoints by topic: `array`, `functions`, `guard`, `number`, `object` and `store`, and still exports them all.

**Color**

- **Breaking:** Remove the `OklabColor` and `OklchColor` classes and the OKLab math helpers. `Color` is now a type.

- Add CSS Color 4 parsing for `hwb()`, `lab()`, `lch()` and `color()`, and the space-separated syntax, like
  `rgb(255 0 0 / 50%)`.

- Add `getContrastRatio`, `getColorDistance`, `mixColors`, `toGamut`, `getChannelColor`, `getChannelGradient`,
  `getChannelThumbColor` and `getSrgbGamutPath`.

- Add the `lightgray` and `transparent` names, and match color names in any case.

- Fix `toString("rgb" | "hsl" | "hsb")` throwing for OKLab and OKLCH colors.

- Fix `rgb()` percentage channels and alpha being parsed as `0`, and invalid `rgb()`, `hsl()` and `hsb()` being
  accepted.

- Fix hex output containing decimals, float noise in color strings, and OKLab and OKLCH losing precision from HSL or
  HSB.

- Fix the `mediumpurple` and `palevioletred` values, and use the exact Display P3 matrix for the sRGB gamut line.

**Interaction** (`@zag-js/utils/interaction`, for moving and resizing a box)

- **Breaking:** Rename rect-utils' helpers.

  ```diff
  - import { applyMove, applyResize, getHandleStyle, getHandleCursor } from "@zag-js/rect-utils"
  + import { moveBox, resizeBox, handleStyle, handleCursor } from "@zag-js/utils/interaction"
  ```

  The keyboard and centering helpers are `arrowDelta`, `resizeKeyDelta`, `centerIn`, `centerOn` and `clampBetween`.
  `hasEdge` and `isCorner` replace the seven handle checks, `HandlePosition` is now `HandlePlacement`, and
  `getDirectionDelta` is removed.

- Snap `gridSize` to grid lines rather than whole steps, in moves and resizes, and keep fractional moves without a grid.

**Number**

- **Breaking:** Remove `fromLength`, `isValueAtMax`, `isValueAtMin`, `getNextStepValue`, `getPreviousStepValue`,
  `getValueSetterAtIndex`, `getClosestValue`, `getClosestValueIndex`, `getMinValueAtIndex`, `getMaxValueAtIndex`,
  `getValueTransformer` and `roundValue`.

- Add `decimalsOf`, `snapValueToStepDirection`, and an optional `scale` to `getValuePercent` and `getPercentValue`.

- Fix step snapping returning float noise like `0.9999999999999992`, and counting steps written as `1e-7`.

- Fix `getValuePercent` returning `NaN` when min and max are equal.

**Search**

- **Breaking:** Remove `createFuzzyMatcher` and `prepareFuzzyTarget`; use `createFuzzySearch` or `fuzzyScore`.

- Add `typeahead`, `createTypeaheadState` and `isTypeaheadKey`.

- Fix `highlightWord` highlighting the wrong characters after text that changes length when lowercased, like "İ".

- Fix `highlightWord` throwing for an array query with `matchAll: false`; it highlights the first match of any term.

**Date and i18n**

- Fix `formatDate`: `G` returned the whole date, `h` and `hh` included the day period, `H` was zero-padded, `mm` and
  `ss` weren't, `z` threw in 24-hour locales, and text inside already formatted values was replaced.

- Fix `getEndOfWeek` ignoring the locale's first day of the week, and ISO week numbers reading `53` instead of `1` for
  weeks starting in late December.

- Fix `parseDateString` turning a day the month doesn't have, like Feb 31, into another date.

- Fix `isRTL` throwing on an invalid locale tag.

**File**

- Add `isAcceptedDragType` to check a dragged file's type against `accept`.

- Fix file types with parameters, like `text/plain;charset=utf-8`, failing the `accept` check.

- Fix `relativePath` missing the `/` between nested directory names in dropped folders.

**JSON tree**

- Make `nodeToValue` return the node's path, like `$.user.name`, instead of a hash of it, so tree view collections build
  about 40% faster. `jsonPathToValue` returns the path unchanged to match.

- Fix objects made with `Object.create(null)` and getters that throw breaking the whole tree, and an object that appears
  twice showing as circular the second time.

- Fix previews: typed arrays read `Uint8Array(7)` instead of `undefined(7)`, empty values read `{}`, buffers show their
  size, classes their name, React elements their children, and circular references read `[Circular]`.

**Other**

- **Breaking:** Move the `Teardown` and `TeardownReason` types to `@zag-js/types`.

- Add `isPromiseLike`.
