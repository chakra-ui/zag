# @zag-js/dom-query

## 0.17.0

### Minor Changes

- [#789](https://github.com/chakra-ui/zag/pull/789)
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine event handling and rename `PublicApi` to `Api`

## 0.16.0

## 0.15.0

## 0.14.0

### Patch Changes

- [`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor machines to avoid the use of `dom.queryById`, this
  causes the machine to throw in React when the `key` of an element is reassigned.

  - Remove `queryById` from the `createScope` function.

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

- [#694](https://github.com/chakra-ui/zag/pull/694)
  [`775f11c9`](https://github.com/chakra-ui/zag/commit/775f11c96759197fcbad14b5b8a0fbde095efc55) Thanks
  [@pawelblaszczyk5](https://github.com/pawelblaszczyk5)! - Improve DOM detection code

## 0.10.2

## 0.10.1

## 0.10.0

### Patch Changes

- [`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `isSelfEvent` function to check if an event originated from an
  element's descendant

## 0.9.2

## 0.9.1

### Patch Changes

- [`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force release every package to fix regression

## 0.1.4

### Patch Changes

- [#543](https://github.com/chakra-ui/zag/pull/543)
  [`1446d88b`](https://github.com/chakra-ui/zag/commit/1446d88bff3848f2a2ec0a793ee83281cda966e8) Thanks
  [@blukai](https://github.com/blukai)! - Fix issue with isTouchDevice usage

## 0.1.3

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

## 0.1.2

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

## 0.1.1

### Patch Changes

- [#462](https://github.com/chakra-ui/zag/pull/462)
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update packages to use explicit `exports` field in `package.json`

## 0.1.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

### Patch Changes

- [#356](https://github.com/chakra-ui/zag/pull/356)
  [`454070e8`](https://github.com/chakra-ui/zag/commit/454070e869619cef905818dfc5248ce60dff94ef) Thanks
  [@anubra266](https://github.com/anubra266)! - - Move `defineDomHelpers` to new package `@zag-js/dom-query`
  - Add `createEmitter` and `createListener` helpers for custom event handling
