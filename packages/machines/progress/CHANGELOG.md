# @zag-js/progress

## 1.0.1

### Patch Changes

- [`9883753`](https://github.com/chakra-ui/zag/commit/98837532c3b9c3f3698eee4e158e4318194361f6) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `<component>.Machine` type to help when typecasting generic
  components like combobox and select.

  Here's an example of the combobox component:

  ```ts
  interface Item {
    code: string
    label: string
  }

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
  })
  ```

- Updated dependencies []:
  - @zag-js/anatomy@1.0.1
  - @zag-js/core@1.0.1
  - @zag-js/types@1.0.1
  - @zag-js/utils@1.0.1
  - @zag-js/dom-query@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [[`b1caa44`](https://github.com/chakra-ui/zag/commit/b1caa44085e7f1da0ad24fc7b25178081811646c)]:
  - @zag-js/core@1.0.0
  - @zag-js/anatomy@1.0.0
  - @zag-js/types@1.0.0
  - @zag-js/utils@1.0.0
  - @zag-js/dom-query@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.2
  - @zag-js/core@0.82.2
  - @zag-js/types@0.82.2
  - @zag-js/utils@0.82.2
  - @zag-js/dom-query@0.82.2

## 0.82.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.1
  - @zag-js/core@0.82.1
  - @zag-js/types@0.82.1
  - @zag-js/utils@0.82.1
  - @zag-js/dom-query@0.82.1

## 0.82.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.0
  - @zag-js/core@0.82.0
  - @zag-js/types@0.82.0
  - @zag-js/utils@0.82.0
  - @zag-js/dom-query@0.82.0

## 0.81.2

### Patch Changes

- Updated dependencies [[`e9313a3`](https://github.com/chakra-ui/zag/commit/e9313a3663285a05c9ac9ac92f1c09fcb27ac818)]:
  - @zag-js/dom-query@0.81.2
  - @zag-js/anatomy@0.81.2
  - @zag-js/core@0.81.2
  - @zag-js/types@0.81.2
  - @zag-js/utils@0.81.2

## 0.81.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.81.1
  - @zag-js/core@0.81.1
  - @zag-js/types@0.81.1
  - @zag-js/utils@0.81.1
  - @zag-js/dom-query@0.81.1

## 0.81.0

### Minor Changes

- [`1185523`](https://github.com/chakra-ui/zag/commit/118552350174c309198b47c1829e1048ac688a0c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `onValueChange` callback

### Patch Changes

- Updated dependencies [[`792939f`](https://github.com/chakra-ui/zag/commit/792939f9d9eac5a97cc46f1b0ab286666ba1edd8),
  [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68)]:
  - @zag-js/dom-query@0.81.0
  - @zag-js/types@0.81.0
  - @zag-js/anatomy@0.81.0
  - @zag-js/core@0.81.0
  - @zag-js/utils@0.81.0

## 0.80.0

### Patch Changes

- Updated dependencies [[`d7617d1`](https://github.com/chakra-ui/zag/commit/d7617d1d95f93b3557eb88ba879737894da42d51)]:
  - @zag-js/dom-query@0.80.0
  - @zag-js/anatomy@0.80.0
  - @zag-js/core@0.80.0
  - @zag-js/types@0.80.0
  - @zag-js/utils@0.80.0

## 0.79.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.3
  - @zag-js/core@0.79.3
  - @zag-js/types@0.79.3
  - @zag-js/utils@0.79.3
  - @zag-js/dom-query@0.79.3

## 0.79.2

### Patch Changes

- Updated dependencies [[`525e645`](https://github.com/chakra-ui/zag/commit/525e645404f56c10919cc9d36279044dff253a08)]:
  - @zag-js/dom-query@0.79.2
  - @zag-js/anatomy@0.79.2
  - @zag-js/core@0.79.2
  - @zag-js/types@0.79.2
  - @zag-js/utils@0.79.2

## 0.79.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.1
  - @zag-js/core@0.79.1
  - @zag-js/types@0.79.1
  - @zag-js/utils@0.79.1
  - @zag-js/dom-query@0.79.1

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.0
  - @zag-js/core@0.79.0
  - @zag-js/types@0.79.0
  - @zag-js/utils@0.79.0
  - @zag-js/dom-query@0.79.0

## 0.78.3

### Patch Changes

- Updated dependencies [[`5584a83`](https://github.com/chakra-ui/zag/commit/5584a833151ee9f2c2ef9c07b6d699addfbca18e)]:
  - @zag-js/core@0.78.3
  - @zag-js/anatomy@0.78.3
  - @zag-js/types@0.78.3
  - @zag-js/utils@0.78.3
  - @zag-js/dom-query@0.78.3

## 0.78.2

### Patch Changes

- Updated dependencies [[`ce85272`](https://github.com/chakra-ui/zag/commit/ce85272c3d64dd4c7bae911ec4e4b813234850c2)]:
  - @zag-js/dom-query@0.78.2
  - @zag-js/anatomy@0.78.2
  - @zag-js/core@0.78.2
  - @zag-js/types@0.78.2
  - @zag-js/utils@0.78.2

## 0.78.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.1
  - @zag-js/core@0.78.1
  - @zag-js/types@0.78.1
  - @zag-js/utils@0.78.1
  - @zag-js/dom-query@0.78.1

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.0
  - @zag-js/core@0.78.0
  - @zag-js/types@0.78.0
  - @zag-js/utils@0.78.0
  - @zag-js/dom-query@0.78.0

## 0.77.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.77.1
  - @zag-js/core@0.77.1
  - @zag-js/types@0.77.1
  - @zag-js/utils@0.77.1
  - @zag-js/dom-query@0.77.1

## 0.77.0

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/dom-query@0.77.0
  - @zag-js/utils@0.77.0
  - @zag-js/core@0.77.0
  - @zag-js/anatomy@0.77.0
  - @zag-js/types@0.77.0

## 0.76.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.76.0
  - @zag-js/core@0.76.0
  - @zag-js/types@0.76.0
  - @zag-js/utils@0.76.0
  - @zag-js/dom-query@0.76.0

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.75.0
  - @zag-js/core@0.75.0
  - @zag-js/types@0.75.0
  - @zag-js/utils@0.75.0
  - @zag-js/dom-query@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.2
  - @zag-js/core@0.74.2
  - @zag-js/types@0.74.2
  - @zag-js/utils@0.74.2
  - @zag-js/dom-query@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.1
  - @zag-js/core@0.74.1
  - @zag-js/types@0.74.1
  - @zag-js/utils@0.74.1
  - @zag-js/dom-query@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.0
  - @zag-js/core@0.74.0
  - @zag-js/types@0.74.0
  - @zag-js/utils@0.74.0
  - @zag-js/dom-query@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.1
  - @zag-js/core@0.73.1
  - @zag-js/types@0.73.1
  - @zag-js/utils@0.73.1
  - @zag-js/dom-query@0.73.1

## 0.73.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.0
  - @zag-js/core@0.73.0
  - @zag-js/types@0.73.0
  - @zag-js/utils@0.73.0
  - @zag-js/dom-query@0.73.0

## 0.72.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.72.0
  - @zag-js/core@0.72.0
  - @zag-js/types@0.72.0
  - @zag-js/utils@0.72.0
  - @zag-js/dom-query@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/core@0.71.0
  - @zag-js/anatomy@0.71.0
  - @zag-js/types@0.71.0
  - @zag-js/utils@0.71.0
  - @zag-js/dom-query@0.71.0

## 0.70.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.70.0
  - @zag-js/core@0.70.0
  - @zag-js/types@0.70.0
  - @zag-js/utils@0.70.0
  - @zag-js/dom-query@0.70.0

## 0.69.0

### Patch Changes

- Updated dependencies [[`bf57d7b`](https://github.com/chakra-ui/zag/commit/bf57d7b3933daf9974eaefc443da6f3c37706bb4)]:
  - @zag-js/dom-query@0.69.0
  - @zag-js/anatomy@0.69.0
  - @zag-js/core@0.69.0
  - @zag-js/types@0.69.0
  - @zag-js/utils@0.69.0

## 0.68.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.1
  - @zag-js/core@0.68.1
  - @zag-js/types@0.68.1
  - @zag-js/utils@0.68.1
  - @zag-js/dom-query@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.0
  - @zag-js/core@0.68.0
  - @zag-js/types@0.68.0
  - @zag-js/utils@0.68.0
  - @zag-js/dom-query@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.67.0
  - @zag-js/core@0.67.0
  - @zag-js/types@0.67.0
  - @zag-js/utils@0.67.0
  - @zag-js/dom-query@0.67.0

## 0.66.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.1
  - @zag-js/core@0.66.1
  - @zag-js/types@0.66.1
  - @zag-js/utils@0.66.1
  - @zag-js/dom-query@0.66.1

## 0.66.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.0
  - @zag-js/core@0.66.0
  - @zag-js/types@0.66.0
  - @zag-js/utils@0.66.0
  - @zag-js/dom-query@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.1
  - @zag-js/core@0.65.1
  - @zag-js/types@0.65.1
  - @zag-js/utils@0.65.1
  - @zag-js/dom-query@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.0
  - @zag-js/core@0.65.0
  - @zag-js/types@0.65.0
  - @zag-js/utils@0.65.0
  - @zag-js/dom-query@0.65.0

## 0.64.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.64.0
  - @zag-js/core@0.64.0
  - @zag-js/types@0.64.0
  - @zag-js/utils@0.64.0
  - @zag-js/dom-query@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies [[`ca437b9`](https://github.com/chakra-ui/zag/commit/ca437b94b49760742bad69aa57a3d6527219782a)]:
  - @zag-js/dom-query@0.63.0
  - @zag-js/anatomy@0.63.0
  - @zag-js/core@0.63.0
  - @zag-js/types@0.63.0
  - @zag-js/utils@0.63.0

## 0.62.1

### Patch Changes

- Updated dependencies [[`5644790`](https://github.com/chakra-ui/zag/commit/564479081d37cd06bc38043fccf9c229379a1531)]:
  - @zag-js/core@0.62.1
  - @zag-js/anatomy@0.62.1
  - @zag-js/types@0.62.1
  - @zag-js/utils@0.62.1
  - @zag-js/dom-query@0.62.1

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.62.0
  - @zag-js/core@0.62.0
  - @zag-js/types@0.62.0
  - @zag-js/utils@0.62.0
  - @zag-js/dom-query@0.62.0

## 0.61.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.1
  - @zag-js/core@0.61.1
  - @zag-js/types@0.61.1
  - @zag-js/utils@0.61.1
  - @zag-js/dom-query@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.0
  - @zag-js/core@0.61.0
  - @zag-js/types@0.61.0
  - @zag-js/utils@0.61.0
  - @zag-js/dom-query@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.60.0
  - @zag-js/anatomy@0.60.0
  - @zag-js/types@0.60.0
  - @zag-js/utils@0.60.0
  - @zag-js/dom-query@0.60.0

## 0.59.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.59.0
  - @zag-js/core@0.59.0
  - @zag-js/types@0.59.0
  - @zag-js/utils@0.59.0
  - @zag-js/dom-query@0.59.0

## 0.58.3

### Patch Changes

- [`557e2ff`](https://github.com/chakra-ui/zag/commit/557e2ff7ae562f13e0690529d0a80abb9710db10) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where progress circle throws warning due to incorrect
  `viewBox` attribute on `<svg>`

- Updated dependencies []:
  - @zag-js/anatomy@0.58.3
  - @zag-js/core@0.58.3
  - @zag-js/types@0.58.3
  - @zag-js/utils@0.58.3
  - @zag-js/dom-query@0.58.3

## 0.58.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.2
  - @zag-js/core@0.58.2
  - @zag-js/types@0.58.2
  - @zag-js/utils@0.58.2
  - @zag-js/dom-query@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.1
  - @zag-js/core@0.58.1
  - @zag-js/types@0.58.1
  - @zag-js/utils@0.58.1
  - @zag-js/dom-query@0.58.1

## 0.58.0

### Minor Changes

- [`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Ensure consistent application of form related properties like
  `invalid`, `required`, and `readOnly`
  - Export `Service` from all machines for use in Lit based components.

### Patch Changes

- Updated dependencies [[`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93)]:
  - @zag-js/dom-query@0.58.0
  - @zag-js/anatomy@0.58.0
  - @zag-js/core@0.58.0
  - @zag-js/types@0.58.0
  - @zag-js/utils@0.58.0

## 0.57.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.57.0
  - @zag-js/core@0.57.0
  - @zag-js/types@0.57.0
  - @zag-js/utils@0.57.0
  - @zag-js/dom-query@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.1
  - @zag-js/core@0.56.1
  - @zag-js/types@0.56.1
  - @zag-js/utils@0.56.1
  - @zag-js/dom-query@0.56.1

## 0.56.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.0
  - @zag-js/core@0.56.0
  - @zag-js/types@0.56.0
  - @zag-js/utils@0.56.0
  - @zag-js/dom-query@0.56.0

## 0.55.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.55.0
  - @zag-js/core@0.55.0
  - @zag-js/types@0.55.0
  - @zag-js/utils@0.55.0
  - @zag-js/dom-query@0.55.0

## 0.54.0

### Patch Changes

- Updated dependencies [[`590c177`](https://github.com/chakra-ui/zag/commit/590c1779f5208fb99114c872175e779508f2f96d)]:
  - @zag-js/core@0.54.0
  - @zag-js/anatomy@0.54.0
  - @zag-js/types@0.54.0
  - @zag-js/utils@0.54.0
  - @zag-js/dom-query@0.54.0

## 0.53.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.53.0
  - @zag-js/core@0.53.0
  - @zag-js/types@0.53.0
  - @zag-js/utils@0.53.0
  - @zag-js/dom-query@0.53.0

## 0.52.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.52.0
  - @zag-js/core@0.52.0
  - @zag-js/types@0.52.0
  - @zag-js/utils@0.52.0
  - @zag-js/dom-query@0.52.0

## 0.51.2

### Patch Changes

- Updated dependencies [[`62eb21b`](https://github.com/chakra-ui/zag/commit/62eb21b60355dd0645936baf4692315134e7488c),
  [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc)]:
  - @zag-js/core@0.51.2
  - @zag-js/dom-query@0.51.2
  - @zag-js/anatomy@0.51.2
  - @zag-js/types@0.51.2
  - @zag-js/utils@0.51.2

## 0.51.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.1
  - @zag-js/core@0.51.1
  - @zag-js/types@0.51.1
  - @zag-js/utils@0.51.1
  - @zag-js/dom-query@0.51.1

## 0.51.0

### Patch Changes

- [`66b31f8`](https://github.com/chakra-ui/zag/commit/66b31f8340f10c59540be25845e4d00166ea5ac1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where using a smaller `max` than `50` throws due to the
  fact the default `value` is set to `50`.

  Now we set the default `value` to mid value between the `min` and `max`

- Updated dependencies []:
  - @zag-js/anatomy@0.51.0
  - @zag-js/core@0.51.0
  - @zag-js/types@0.51.0
  - @zag-js/utils@0.51.0
  - @zag-js/dom-query@0.51.0

## 0.50.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.50.0
  - @zag-js/core@0.50.0
  - @zag-js/types@0.50.0
  - @zag-js/utils@0.50.0
  - @zag-js/dom-query@0.50.0

## 0.49.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.49.0
  - @zag-js/anatomy@0.49.0
  - @zag-js/types@0.49.0
  - @zag-js/utils@0.49.0
  - @zag-js/dom-query@0.49.0

## 0.48.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.48.0
  - @zag-js/core@0.48.0
  - @zag-js/types@0.48.0
  - @zag-js/utils@0.48.0
  - @zag-js/dom-query@0.48.0

## 0.47.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.47.0
  - @zag-js/core@0.47.0
  - @zag-js/types@0.47.0
  - @zag-js/utils@0.47.0
  - @zag-js/dom-query@0.47.0

## 0.46.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.46.0
  - @zag-js/core@0.46.0
  - @zag-js/types@0.46.0
  - @zag-js/utils@0.46.0
  - @zag-js/dom-query@0.46.0

## 0.45.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.45.0
  - @zag-js/core@0.45.0
  - @zag-js/types@0.45.0
  - @zag-js/utils@0.45.0
  - @zag-js/dom-query@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.44.0
  - @zag-js/core@0.44.0
  - @zag-js/types@0.44.0
  - @zag-js/utils@0.44.0
  - @zag-js/dom-query@0.44.0

## 0.43.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.43.0
  - @zag-js/core@0.43.0
  - @zag-js/types@0.43.0
  - @zag-js/utils@0.43.0
  - @zag-js/dom-query@0.43.0

## 0.42.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.42.0
  - @zag-js/core@0.42.0
  - @zag-js/types@0.42.0
  - @zag-js/utils@0.42.0
  - @zag-js/dom-query@0.42.0

## 0.41.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.41.0
  - @zag-js/core@0.41.0
  - @zag-js/types@0.41.0
  - @zag-js/utils@0.41.0
  - @zag-js/dom-query@0.41.0

## 0.40.0

### Patch Changes

- [#1362](https://github.com/chakra-ui/zag/pull/1362)
  [`f71a5b0`](https://github.com/chakra-ui/zag/commit/f71a5b03cc06853b66952aa7e6e2b5e2cda1a36f) Thanks
  [@iNetJoJo](https://github.com/iNetJoJo)! - Fix issue where circular progress circle diameter doesn't get calculated
  correctly

- Updated dependencies []:
  - @zag-js/anatomy@0.40.0
  - @zag-js/core@0.40.0
  - @zag-js/types@0.40.0
  - @zag-js/utils@0.40.0
  - @zag-js/dom-query@0.40.0

## 0.39.0

### Patch Changes

- [`a621fe5`](https://github.com/chakra-ui/zag/commit/a621fe5445f938341e761539471e737eaa149da5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where progress throws when value is initially set to
  `null`

- Updated dependencies []:
  - @zag-js/anatomy@0.39.0
  - @zag-js/core@0.39.0
  - @zag-js/types@0.39.0
  - @zag-js/utils@0.39.0
  - @zag-js/dom-query@0.39.0

## 0.38.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.1
  - @zag-js/core@0.38.1
  - @zag-js/types@0.38.1
  - @zag-js/utils@0.38.1
  - @zag-js/dom-query@0.38.1

## 0.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.0
  - @zag-js/core@0.38.0
  - @zag-js/types@0.38.0
  - @zag-js/utils@0.38.0
  - @zag-js/dom-query@0.38.0

## 0.37.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.3
  - @zag-js/core@0.37.3
  - @zag-js/types@0.37.3
  - @zag-js/utils@0.37.3
  - @zag-js/dom-query@0.37.3

## 0.37.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.2
  - @zag-js/core@0.37.2
  - @zag-js/types@0.37.2
  - @zag-js/utils@0.37.2
  - @zag-js/dom-query@0.37.2

## 0.37.1

### Patch Changes

- [`d9d5263`](https://github.com/chakra-ui/zag/commit/d9d52636fbd3a731a4764b865ac82afd4f163baf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `splitProps` function to improve DX of creating custom
  components on top of Zag.js

- Updated dependencies []:
  - @zag-js/anatomy@0.37.1
  - @zag-js/core@0.37.1
  - @zag-js/types@0.37.1
  - @zag-js/utils@0.37.1
  - @zag-js/dom-query@0.37.1

## 0.37.0

### Patch Changes

- Updated dependencies [[`2a024fb`](https://github.com/chakra-ui/zag/commit/2a024fbd2e98343218d4d658e91f1d8c751e1a4d)]:
  - @zag-js/types@0.37.0
  - @zag-js/anatomy@0.37.0
  - @zag-js/core@0.37.0
  - @zag-js/utils@0.37.0
  - @zag-js/dom-query@0.37.0

## 0.36.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.3
  - @zag-js/core@0.36.3
  - @zag-js/types@0.36.3
  - @zag-js/utils@0.36.3
  - @zag-js/dom-query@0.36.3

## 0.36.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.2
  - @zag-js/core@0.36.2
  - @zag-js/types@0.36.2
  - @zag-js/utils@0.36.2
  - @zag-js/dom-query@0.36.2

## 0.36.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.1
  - @zag-js/core@0.36.1
  - @zag-js/types@0.36.1
  - @zag-js/utils@0.36.1
  - @zag-js/dom-query@0.36.1

## 0.36.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.0
  - @zag-js/core@0.36.0
  - @zag-js/types@0.36.0
  - @zag-js/utils@0.36.0
  - @zag-js/dom-query@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [[`0216161`](https://github.com/chakra-ui/zag/commit/0216161fd3d429409abc96941d33a0c333ef8d36)]:
  - @zag-js/core@0.35.0
  - @zag-js/anatomy@0.35.0
  - @zag-js/types@0.35.0
  - @zag-js/utils@0.35.0
  - @zag-js/dom-query@0.35.0

## 0.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.34.0
  - @zag-js/core@0.34.0
  - @zag-js/types@0.34.0
  - @zag-js/utils@0.34.0
  - @zag-js/dom-query@0.34.0

## 0.33.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.33.2
  - @zag-js/core@0.33.2
  - @zag-js/types@0.33.2
  - @zag-js/utils@0.33.2
  - @zag-js/dom-query@0.33.2

## 0.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.33.1
  - @zag-js/anatomy@0.33.1
  - @zag-js/types@0.33.1
  - @zag-js/utils@0.33.1
  - @zag-js/dom-query@0.33.1

## 0.33.0

### Minor Changes

- [`9f914ea`](https://github.com/chakra-ui/zag/commit/9f914ea7860406f2be8a55b27dc25e28cd20d854) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename indicator part to view

### Patch Changes

- Updated dependencies [[`7872cdf`](https://github.com/chakra-ui/zag/commit/7872cdf8aeb28b9a30cd4a016bd12e5366054511)]:
  - @zag-js/core@0.33.0
  - @zag-js/anatomy@0.33.0
  - @zag-js/types@0.33.0
  - @zag-js/utils@0.33.0
  - @zag-js/dom-query@0.33.0

## 0.32.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.32.1
  - @zag-js/core@0.32.1
  - @zag-js/types@0.32.1
  - @zag-js/utils@0.32.1
  - @zag-js/dom-query@0.32.1

## 0.32.0

### Patch Changes

- [`d1dc4fa`](https://github.com/chakra-ui/zag/commit/d1dc4fad981024a88c5d84e88b6ae3669d0c5329) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where circular progress does not be render correctly

- Updated dependencies []:
  - @zag-js/anatomy@0.32.0
  - @zag-js/core@0.32.0
  - @zag-js/types@0.32.0
  - @zag-js/utils@0.32.0
  - @zag-js/dom-query@0.32.0

## 0.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.1
  - @zag-js/core@0.31.1
  - @zag-js/types@0.31.1
  - @zag-js/utils@0.31.1
  - @zag-js/dom-query@0.31.1

## 0.31.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.0
  - @zag-js/core@0.31.0
  - @zag-js/types@0.31.0
  - @zag-js/utils@0.31.0
  - @zag-js/dom-query@0.31.0
