# @zag-js/carousel

## 0.17.0

### Minor Changes

- [#789](https://github.com/chakra-ui/zag/pull/789)
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine event handling and rename `PublicApi` to `Api`

### Patch Changes

- Updated dependencies [[`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82)]:
  - @zag-js/dom-query@0.17.0
  - @zag-js/anatomy@0.17.0
  - @zag-js/core@0.17.0
  - @zag-js/types@0.17.0
  - @zag-js/utils@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dom-query@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.15.0
  - @zag-js/core@0.15.0
  - @zag-js/types@0.15.0
  - @zag-js/utils@0.15.0
  - @zag-js/dom-query@0.15.0

## 0.14.0

### Minor Changes

- [#778](https://github.com/chakra-ui/zag/pull/778)
  [`efa54cc8`](https://github.com/chakra-ui/zag/commit/efa54cc89ac777a1cf47759c523e2174fcf3ee20) Thanks
  [@cschroeter](https://github.com/cschroeter)! - ## Breaking Changes

  Rename nextTrigger, prevTrigger to nextSlideTrigger and prevSlideTrigger to be more explicit.

### Patch Changes

- [`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor machines to avoid the use of `dom.queryById`, this
  causes the machine to throw in React when the `key` of an element is reassigned.

  - Remove `queryById` from the `createScope` function.

- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/utils@0.14.0

## 0.13.0

### Patch Changes

- Updated dependencies [[`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414)]:
  - @zag-js/core@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dom-query@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.12.0
  - @zag-js/core@0.12.0
  - @zag-js/types@0.12.0
  - @zag-js/utils@0.12.0
  - @zag-js/dom-query@0.12.0

## 0.11.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.11.2
  - @zag-js/core@0.11.2
  - @zag-js/types@0.11.2
  - @zag-js/utils@0.11.2
  - @zag-js/dom-query@0.11.2

## 0.11.1

### Patch Changes

- [`a88bee43`](https://github.com/chakra-ui/zag/commit/a88bee43969a8dc217619d14bd1b7c26a6305915) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose the types and add `onClick` to carousel indicator

- Updated dependencies []:
  - @zag-js/anatomy@0.11.1
  - @zag-js/core@0.11.1
  - @zag-js/types@0.11.1
  - @zag-js/utils@0.11.1
  - @zag-js/dom-query@0.11.1

## 0.11.0

### Patch Changes

- [`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rebuild all packages using tsup

- Updated dependencies [[`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce)]:
  - @zag-js/dom-query@0.11.0
  - @zag-js/utils@0.11.0
  - @zag-js/anatomy@0.11.0
  - @zag-js/types@0.11.0
  - @zag-js/core@0.11.0

## 0.10.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.5
  - @zag-js/core@0.10.5
  - @zag-js/types@0.10.5
  - @zag-js/utils@0.10.5
  - @zag-js/dom-query@0.10.5

## 0.10.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.4
  - @zag-js/core@0.10.4
  - @zag-js/types@0.10.4
  - @zag-js/utils@0.10.4
  - @zag-js/dom-query@0.10.4

## 0.10.3

### Patch Changes

- [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Use vite to build packages

- Updated dependencies [[`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7),
  [`775f11c9`](https://github.com/chakra-ui/zag/commit/775f11c96759197fcbad14b5b8a0fbde095efc55)]:
  - @zag-js/anatomy@0.10.3
  - @zag-js/core@0.10.3
  - @zag-js/types@0.10.3
  - @zag-js/utils@0.10.3
  - @zag-js/dom-query@0.10.3

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.2
  - @zag-js/core@0.10.2
  - @zag-js/types@0.10.2
  - @zag-js/utils@0.10.2
  - @zag-js/dom-query@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.1
  - @zag-js/core@0.10.1
  - @zag-js/types@0.10.1
  - @zag-js/utils@0.10.1
  - @zag-js/dom-query@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da),
  [`d2838286`](https://github.com/chakra-ui/zag/commit/d2838286fc13acae3f0818653d5feee982703f23),
  [`2a1fb4a0`](https://github.com/chakra-ui/zag/commit/2a1fb4a0740e6ad8e2902265e14597f087007675),
  [`a30258e8`](https://github.com/chakra-ui/zag/commit/a30258e8137bfba5811471919e463b79039848b6)]:
  - @zag-js/dom-query@0.10.0
  - @zag-js/anatomy@0.10.0
  - @zag-js/types@0.10.0
  - @zag-js/core@0.10.0
  - @zag-js/utils@0.10.0

## 0.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.9.2
  - @zag-js/core@0.9.2
  - @zag-js/types@0.9.2
  - @zag-js/utils@0.9.2
  - @zag-js/dom-query@0.9.2

## 0.9.1

### Patch Changes

- [`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force release every package to fix regression

- Updated dependencies [[`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f)]:
  - @zag-js/anatomy@0.9.1
  - @zag-js/core@0.9.1
  - @zag-js/types@0.9.1
  - @zag-js/utils@0.9.1
  - @zag-js/dom-query@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.7.0

### Patch Changes

- [`99b9ba52`](https://github.com/chakra-ui/zag/commit/99b9ba52a56bab0d89948a3f43616a6f44ead7ad) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve support for spacing and slides per view

- [`d3c11c51`](https://github.com/chakra-ui/zag/commit/d3c11c510dedda6d86159ed7e5736d9e7083c028) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure ids of underlying elements can customized based on `ids`
  context property.

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.5.0

### Patch Changes

- Updated dependencies [[`ec07ff35`](https://github.com/chakra-ui/zag/commit/ec07ff3590916ebcb4450b64207370ee2af9d3d1),
  [`54377b1c`](https://github.com/chakra-ui/zag/commit/54377b1c4ed85deb06453a00648b7c2c1f0c72df)]:
  - @zag-js/core@0.5.0
  - @zag-js/types@0.5.0

## 0.0.4

### Patch Changes

- Updated dependencies [[`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0)]:
  - @zag-js/utils@0.3.4
  - @zag-js/core@0.2.12

## 0.0.3

### Patch Changes

- [`02519621`](https://github.com/chakra-ui/zag/commit/0251962117aa330d9b47eac70cc613186569fa1c) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Fix issue where carousel anatomy was not exported

- Updated dependencies [[`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2)]:
  - @zag-js/core@0.2.11

## 0.0.2

### Patch Changes

- Updated dependencies [[`1446d88b`](https://github.com/chakra-ui/zag/commit/1446d88bff3848f2a2ec0a793ee83281cda966e8)]:
  - @zag-js/dom-query@0.1.4

## 0.0.1

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

- Updated dependencies [[`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99)]:
  - @zag-js/dom-query@0.1.3
  - @zag-js/core@0.2.10
