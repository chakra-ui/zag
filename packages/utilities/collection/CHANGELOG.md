# @zag-js/collection

## 1.8.0

### Minor Changes

- [#2396](https://github.com/chakra-ui/zag/pull/2396)
  [`0cb6c0e`](https://github.com/chakra-ui/zag/commit/0cb6c0e70193b8a30c17c96f2b739be215f266ed) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - **ListCollection**

  - Fix stale issues in mutation methods by returning a new `ListCollection` instead of mutating the internal `items`

    - Add new methods to the list collection: `update`, `upsert`, `remove`, `append`, `prepend`, `move`

  - **GridCollection**

    - Add new methods to the grid collection: `getCell`, `getValueCell`, `getFirstEnabledColumnIndex`,
      `getLastEnabledColumnIndex`, `getNextRowValue`, `getPreviousRowValue`

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.7.0

## 1.6.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.5.0

## 1.4.2

### Patch Changes

- [`469d927`](https://github.com/chakra-ui/zag/commit/469d927388e32ebafb8db22f6ad199b15b65b0bb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where select `valueAsString` loses reactivity

- Updated dependencies []:
  - @zag-js/utils@1.4.2

## 1.4.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.4.1

## 1.4.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`66ba41b`](https://github.com/chakra-ui/zag/commit/66ba41bb10b232ff08e3cfbfc6cbf2a1c7449e21)]:
  - @zag-js/utils@1.3.3

## 1.3.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.3.1

## 1.3.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.1.0

## 1.0.2

### Patch Changes

- [`2fdf79c`](https://github.com/chakra-ui/zag/commit/2fdf79c82a5cbfa876adc858886ce22b8b52d8fb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Widen `items` type to allow `Iterable` instead of just `Array`
  since we internally convert iterables to an array.

- Updated dependencies []:
  - @zag-js/utils@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.82.2

## 0.82.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.82.1

## 0.82.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.82.0

## 0.81.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.81.2

## 0.81.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.81.1

## 0.81.0

### Patch Changes

- [`2e4ae72`](https://github.com/chakra-ui/zag/commit/2e4ae729818cd334d9cfe4ddb15c14dc2aabb6bb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - **TreeCollection**: Add support for new methods:

  - `getPreviousSibling`: Get the previous sibling node of the given node.
  - `getNextSibling`: Get the next sibling node of the given node.
  - `remove`: Remove the given node from the collection.

- Updated dependencies []:
  - @zag-js/utils@0.81.0

## 0.80.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.80.0

## 0.79.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.79.3

## 0.79.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.79.2

## 0.79.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.79.1

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.79.0

## 0.78.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.78.3

## 0.78.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.78.2

## 0.78.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.78.1

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.78.0

## 0.77.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.77.1

## 0.77.0

### Minor Changes

- [`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor treeview to use the new tree collection for better
  rendering and logic management.

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/utils@0.77.0

## 0.76.0

### Minor Changes

- [`70297fe`](https://github.com/chakra-ui/zag/commit/70297fe6abbbc164ab2d38079122e23f8382a23a) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `TreeCollection` which will be used to traverse
  trees in the treeview and cascader components.

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.76.0

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.73.1

## 0.73.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.73.0

## 0.72.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/utils@0.71.0

## 0.70.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.70.0

## 0.69.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.69.0

## 0.68.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.67.0

## 0.66.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.66.1

## 0.66.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.65.0

## 0.64.0

### Minor Changes

- [`c1a9ea7`](https://github.com/chakra-ui/zag/commit/c1a9ea763a7d74d31d63b57c2e2f66bd8deaf42b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING: Rename `Collection` class to `ListCollection` to better
  reflect its intent.

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.63.0

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.62.1

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.62.0

## 0.61.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.60.0

## 0.59.0

### Patch Changes

- [#1625](https://github.com/chakra-ui/zag/pull/1625)
  [`1441d06`](https://github.com/chakra-ui/zag/commit/1441d06c03e0fc3958c8b25821b19db2398549dc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve reliability of select and combobox by redesigning the
  collection interface

- Updated dependencies []:
  - @zag-js/utils@0.59.0

## 0.58.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.58.3

## 0.58.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.58.1

## 0.58.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/utils@0.58.0

## 0.57.0

### Minor Changes

- [`761f185`](https://github.com/chakra-ui/zag/commit/761f185bc0e3fa337fcde6d3eeaae8e4a00ac00b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for selecting all values using `api.selectAll()`

## 0.56.1

## 0.56.0

## 0.55.0

## 0.54.0

## 0.53.0

## 0.52.0

### Patch Changes

- [`390f2c0`](https://github.com/chakra-ui/zag/commit/390f2c0ae813c93ae8513c515295f8ca3be4c10b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where changing the label of a collection item doesn't
  trigger a change in select and combobox components.

## 0.51.2

## 0.51.1

## 0.51.0

## 0.50.0

### Patch Changes

- [#1483](https://github.com/chakra-ui/zag/pull/1483)
  [`8f325a8`](https://github.com/chakra-ui/zag/commit/8f325a8a966256c45410ed3e953d7f041d40b658) Thanks
  [@maastrich](https://github.com/maastrich)! - Ensure collection are considered different when item's disabled property
  changes

## 0.49.0

## 0.48.0

### Patch Changes

- [#1434](https://github.com/chakra-ui/zag/pull/1434)
  [`ed0ee38`](https://github.com/chakra-ui/zag/commit/ed0ee38da9bea2ec7d7aa46ba5c1bc11d8dadb1d) Thanks
  [@erm1116](https://github.com/erm1116)! - Fix issue where value is unintentionally sorted when highlighting item in
  the combobox and the select machine

## 0.47.0

## 0.46.0

## 0.45.0

## 0.44.0

## 0.43.0

## 0.42.0

## 0.41.0

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

## 0.34.0

## 0.33.2

## 0.33.1

## 0.33.0

## 0.32.1

## 0.32.0

### Patch Changes

- [#1095](https://github.com/chakra-ui/zag/pull/1095)
  [`651346b`](https://github.com/chakra-ui/zag/commit/651346b1cd280b3882253425e9054caf985f83a7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add equality method to check if two collections are equal

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

### Patch Changes

- [`c2804903`](https://github.com/chakra-ui/zag/commit/c2804903811a29d4acfb697c8a098c74b2a5688b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for readonly items in collection type

## 0.20.0

### Patch Changes

- [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove toggle machine

## 0.19.1

### Patch Changes

- [`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where change callbacks could be executed excessively
  when no value changed.

## 0.19.0

### Patch Changes

- [`e4d78be4`](https://github.com/chakra-ui/zag/commit/e4d78be47b4b46e97be943b78561213b022c692c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Loosen the collection item types to allow string item
  - Add generic to select and combobox context and api

## 0.18.0
