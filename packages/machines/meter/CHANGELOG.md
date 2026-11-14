# @zag-js/meter

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.5
  - @zag-js/core@2.0.0-next.5
  - @zag-js/types@2.0.0-next.5
  - @zag-js/utils@2.0.0-next.5
  - @zag-js/dom-query@2.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`d6089c3`](https://github.com/chakra-ui/zag/commit/d6089c3f31a0952f7f35a0b8c08427770b43aac9) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Clamp controlled values to `min` and `max`, and allow
  `min` to equal `max`.

  - Fall back to `min` when the value is `NaN`.

  - Fix `percentAsString` using the value format instead of a percent.

  - **Breaking:** Default the value to `min` instead of the midpoint. Pass a value to keep the old default.

    ```diff
    - meter.machine({ min: 0, max: 100 })
    + meter.machine({ min: 0, max: 100, defaultValue: 50 })
    ```

### Patch Changes

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633)]:
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4

## 2.0.0-next.3

### Minor Changes

- [#3308](https://github.com/chakra-ui/zag/pull/3308)
  [`cbc53b1`](https://github.com/chakra-ui/zag/commit/cbc53b1db92d0884dd764314e543f456de42e090) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add the `meter` machine for a scalar measurement in a
  known range, with HTML `low` / `high` / `optimum` regions exposed as `valueState`.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3
