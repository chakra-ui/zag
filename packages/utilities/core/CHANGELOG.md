# @zag-js/utils

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

## 0.31.1

## 0.31.0

## 0.30.0

## 0.29.0

## 0.28.1

## 0.28.0

### Patch Changes

- [`e433b3ee`](https://github.com/chakra-ui/zag/commit/e433b3ee5b49a1099b8be2df99a4a5056fc1ecfd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `remove` and `removeAt` utilities doesn't triger a
  context update

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

### Patch Changes

- [`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where change callbacks could be executed excessively
  when no value changed.

## 0.19.0

## 0.18.0

### Minor Changes

- [#826](https://github.com/chakra-ui/zag/pull/826)
  [`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - > Breaking Changes 💥

  Redesign select and combobox API to allow passing value as `string` and `collection`

  Prior to this change, Zag computes the label and value from the DOM element. While this worked, it makes it
  challenging to manage complex objects that don't match the `label` and `value` convention.

  ```jsx
  // Create the collection
  const collection = select.collection({
    items: [],
    itemToString(item) {
      return item.label
    },
    itemToValue(item) {
      return item.value
    },
  })

  // Pass the collection to the select machine
  const [state, send] = useMachine(
    select.machine({
      collection,
      id: useId(),
    }),
  )
  ```

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

## 0.3.4

### Patch Changes

- [`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `machine.getState` returned a snapshot that is
  incompatible with Solid.js

## 0.3.3

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

## 0.3.2

### Patch Changes

- [#462](https://github.com/chakra-ui/zag/pull/462)
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update packages to use explicit `exports` field in `package.json`

## 0.3.1

### Patch Changes

- [#378](https://github.com/chakra-ui/zag/pull/378)
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add function to convert `Proxy` to JS object

## 0.3.0

### Minor Changes

- [`6092a10f`](https://github.com/chakra-ui/zag/commit/6092a10f51d2b7fabe503cf4bb3506c02d4ee201) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - `compact`: Add utility to deeply filter `undefined` value in
  objects

## 0.2.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

## 0.1.6

### Patch Changes

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

## 0.1.5

### Patch Changes

- [`61c11646`](https://github.com/chakra-ui/zag/commit/61c116467c1758bdda7efe1f27d4ed26e7d44624) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix TypeScript issues emitted by v4.8

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

## 0.1.4

### Patch Changes

- [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump all packages

## 0.1.3

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

## 0.1.2

### Patch Changes

- [`e2f62c7a`](https://github.com/chakra-ui/zag/commit/e2f62c7a30266e7e2c8b1b10b55a22fb979199ed) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor package structure

* [`ef2872d7`](https://github.com/chakra-ui/zag/commit/ef2872d7b291fa39c6b6293ae12f522d811a2190) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor utility functions and add fire event utils

## 0.1.1

### Patch Changes

- [#74](https://github.com/chakra-ui/zag/pull/74)
  [`6e175c6`](https://github.com/chakra-ui/zag/commit/6e175c6a69bb70fb78ccdd77a25d83a164298888) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve `isModifiedEvent` helper function

## 0.1.0

### Minor Changes

- [`157aadc`](https://github.com/chakra-ui/zag/commit/157aadc3ac572d2289432efe32ae3f15a2be4ad1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release
