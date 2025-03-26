# @zag-js/element-rect

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

## 0.68.0

## 0.67.0

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

## 0.8.0

### Minor Changes

- [`bf136f6e`](https://github.com/chakra-ui/zag/commit/bf136f6ef8c9499bd0fbc4be057d02697e97a010) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support customizing the element rect calculation function

## 0.3.0

### Minor Changes

- [`fa2ecc8e`](https://github.com/chakra-ui/zag/commit/fa2ecc8ea235b824f45deda10070c321f896886c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for scoping the element rect tracking to size,
  position or rect.

  ```js
  import { trackElementRect } from "@zag-js/element-rect"

  trackElementRect(element, update, { scope: "size" }) // only track size
  trackElementRect(element, update, { scope: "position" }) // only track position
  trackElementRect(element, update, { scope: "rect" }) // track size and position (default)
  ```

## 0.2.2

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

## 0.2.1

### Patch Changes

- [#462](https://github.com/chakra-ui/zag/pull/462)
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update packages to use explicit `exports` field in `package.json`

## 0.2.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

## 0.1.3

### Patch Changes

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

## 0.1.2

### Patch Changes

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

## 0.1.1

### Patch Changes

- [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump all packages

## 0.1.0

### Minor Changes

- [`3f3de2b4`](https://github.com/chakra-ui/zag/commit/3f3de2b4e6619e99644d24e15df8016ee3e574a5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release
