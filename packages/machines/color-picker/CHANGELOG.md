# @zag-js/color-picker

## 0.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/color-utils@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dom-event@0.16.0
  - @zag-js/dom-query@0.16.0
  - @zag-js/form-utils@0.16.0
  - @zag-js/numeric-range@0.16.0
  - @zag-js/text-selection@0.16.0
  - @zag-js/visually-hidden@0.16.0

## 0.15.0

### Minor Changes

- [`4be63ee4`](https://github.com/chakra-ui/zag/commit/4be63ee426b33944ab6a093772536c5aaed78f3e) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Machines no longer export hiddenInput as part of their anatomy API

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.15.0
  - @zag-js/core@0.15.0
  - @zag-js/types@0.15.0
  - @zag-js/color-utils@0.15.0
  - @zag-js/utils@0.15.0
  - @zag-js/dom-event@0.15.0
  - @zag-js/dom-query@0.15.0
  - @zag-js/form-utils@0.15.0
  - @zag-js/numeric-range@0.15.0
  - @zag-js/text-selection@0.15.0
  - @zag-js/visually-hidden@0.15.0

## 0.14.0

### Minor Changes

- [`ae3fb926`](https://github.com/chakra-ui/zag/commit/ae3fb92675484d5c468f8c3bc64d9ac69178be85) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Rename parts in anatomy to match rest of the machine

### Patch Changes

- [`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor machines to avoid the use of `dom.queryById`, this
  causes the machine to throw in React when the `key` of an element is reassigned.

  - Remove `queryById` from the `createScope` function.

- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/text-selection@0.14.0
  - @zag-js/dom-event@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/color-utils@0.14.0
  - @zag-js/utils@0.14.0
  - @zag-js/form-utils@0.14.0
  - @zag-js/numeric-range@0.14.0
  - @zag-js/visually-hidden@0.14.0

## 0.13.0

### Patch Changes

- [`ed617a86`](https://github.com/chakra-ui/zag/commit/ed617a864cd4420e727641963239aba030ba3cf2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where `isEqual` doesn't consider alpha channel.
  - Fix keyboard navigation in color picker between area and channel slider thumb.
- Updated dependencies [[`ed617a86`](https://github.com/chakra-ui/zag/commit/ed617a864cd4420e727641963239aba030ba3cf2),
  [`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414)]:
  - @zag-js/color-utils@0.13.0
  - @zag-js/core@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dom-event@0.13.0
  - @zag-js/dom-query@0.13.0
  - @zag-js/numeric-range@0.13.0
  - @zag-js/text-selection@0.13.0

## 0.12.0

### Patch Changes

- [`cf90c4f5`](https://github.com/chakra-ui/zag/commit/cf90c4f561e6193f5bdfeae0393e3a8fdee76241) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where focusing on area thumb doesn't transition to
  focused state, making keyboard navigation not work.

- Updated dependencies []:
  - @zag-js/anatomy@0.12.0
  - @zag-js/core@0.12.0
  - @zag-js/types@0.12.0
  - @zag-js/color-utils@0.12.0
  - @zag-js/utils@0.12.0
  - @zag-js/dom-event@0.12.0
  - @zag-js/dom-query@0.12.0
  - @zag-js/numeric-range@0.12.0
  - @zag-js/text-selection@0.12.0

## 0.11.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.11.2
  - @zag-js/core@0.11.2
  - @zag-js/types@0.11.2
  - @zag-js/color-utils@0.11.2
  - @zag-js/utils@0.11.2
  - @zag-js/dom-event@0.11.2
  - @zag-js/dom-query@0.11.2
  - @zag-js/numeric-range@0.11.2
  - @zag-js/text-selection@0.11.2

## 0.11.1

### Patch Changes

- [`aa30f407`](https://github.com/chakra-ui/zag/commit/aa30f40792cf5b953a99e7ce97e43fb0cbc4afa2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix types exports

- Updated dependencies []:
  - @zag-js/anatomy@0.11.1
  - @zag-js/core@0.11.1
  - @zag-js/types@0.11.1
  - @zag-js/color-utils@0.11.1
  - @zag-js/utils@0.11.1
  - @zag-js/dom-event@0.11.1
  - @zag-js/dom-query@0.11.1
  - @zag-js/numeric-range@0.11.1
  - @zag-js/text-selection@0.11.1

## 0.11.0

### Patch Changes

- [`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rebuild all packages using tsup

- Updated dependencies [[`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce)]:
  - @zag-js/text-selection@0.11.0
  - @zag-js/numeric-range@0.11.0
  - @zag-js/color-utils@0.11.0
  - @zag-js/dom-event@0.11.0
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
  - @zag-js/color-utils@0.10.5
  - @zag-js/utils@0.10.5
  - @zag-js/dom-event@0.10.5
  - @zag-js/dom-query@0.10.5
  - @zag-js/numeric-range@0.10.5
  - @zag-js/text-selection@0.10.5

## 0.10.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.4
  - @zag-js/core@0.10.4
  - @zag-js/types@0.10.4
  - @zag-js/color-utils@0.10.4
  - @zag-js/utils@0.10.4
  - @zag-js/dom-event@0.10.4
  - @zag-js/dom-query@0.10.4
  - @zag-js/numeric-range@0.10.4
  - @zag-js/text-selection@0.10.4

## 0.10.3

### Patch Changes

- [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Use vite to build packages

- Updated dependencies [[`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7),
  [`775f11c9`](https://github.com/chakra-ui/zag/commit/775f11c96759197fcbad14b5b8a0fbde095efc55)]:
  - @zag-js/anatomy@0.10.3
  - @zag-js/core@0.10.3
  - @zag-js/types@0.10.3
  - @zag-js/color-utils@0.10.3
  - @zag-js/utils@0.10.3
  - @zag-js/dom-event@0.10.3
  - @zag-js/dom-query@0.10.3
  - @zag-js/numeric-range@0.10.3
  - @zag-js/text-selection@0.10.3

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.2
  - @zag-js/core@0.10.2
  - @zag-js/types@0.10.2
  - @zag-js/color-utils@0.10.2
  - @zag-js/utils@0.10.2
  - @zag-js/dom-event@0.10.2
  - @zag-js/dom-query@0.10.2
  - @zag-js/numeric-range@0.10.2
  - @zag-js/text-selection@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.1
  - @zag-js/core@0.10.1
  - @zag-js/types@0.10.1
  - @zag-js/color-utils@0.10.1
  - @zag-js/utils@0.10.1
  - @zag-js/dom-event@0.10.1
  - @zag-js/dom-query@0.10.1
  - @zag-js/numeric-range@0.10.1
  - @zag-js/text-selection@0.10.1

## 0.10.0

### Patch Changes

- [`dbc13547`](https://github.com/chakra-ui/zag/commit/dbc13547deeef869640f637f3c0affab8fb82c17) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor point calculation algorithm

- Updated dependencies [[`dbc13547`](https://github.com/chakra-ui/zag/commit/dbc13547deeef869640f637f3c0affab8fb82c17),
  [`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da),
  [`d2838286`](https://github.com/chakra-ui/zag/commit/d2838286fc13acae3f0818653d5feee982703f23),
  [`2a1fb4a0`](https://github.com/chakra-ui/zag/commit/2a1fb4a0740e6ad8e2902265e14597f087007675),
  [`a30258e8`](https://github.com/chakra-ui/zag/commit/a30258e8137bfba5811471919e463b79039848b6)]:
  - @zag-js/dom-event@0.10.0
  - @zag-js/dom-query@0.10.0
  - @zag-js/anatomy@0.10.0
  - @zag-js/types@0.10.0
  - @zag-js/text-selection@0.10.0
  - @zag-js/core@0.10.0
  - @zag-js/color-utils@0.10.0
  - @zag-js/utils@0.10.0
  - @zag-js/numeric-range@0.10.0

## 0.9.2

### Patch Changes

- [`280015e3`](https://github.com/chakra-ui/zag/commit/280015e36539f23731cba09a28e1371d5760b8b4) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where event point calculation is incorrect when the page
  is scrolled

- Updated dependencies [[`280015e3`](https://github.com/chakra-ui/zag/commit/280015e36539f23731cba09a28e1371d5760b8b4)]:
  - @zag-js/dom-event@0.9.2
  - @zag-js/anatomy@0.9.2
  - @zag-js/core@0.9.2
  - @zag-js/types@0.9.2
  - @zag-js/color-utils@0.9.2
  - @zag-js/utils@0.9.2
  - @zag-js/dom-query@0.9.2
  - @zag-js/numeric-range@0.9.2
  - @zag-js/text-selection@0.9.2

## 0.9.1

### Patch Changes

- [`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force release every package to fix regression

- Updated dependencies [[`8469daa1`](https://github.com/chakra-ui/zag/commit/8469daa15fd7f2c0a80869a8715b0342bd3c355f)]:
  - @zag-js/anatomy@0.9.1
  - @zag-js/core@0.9.1
  - @zag-js/types@0.9.1
  - @zag-js/color-utils@0.9.1
  - @zag-js/utils@0.9.1
  - @zag-js/dom-event@0.9.1
  - @zag-js/dom-query@0.9.1
  - @zag-js/numeric-range@0.9.1
  - @zag-js/text-selection@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [[`fb4fb42d`](https://github.com/chakra-ui/zag/commit/fb4fb42d8aacc5844945dd7b1bd27b94c978ca4e)]:
  - @zag-js/text-selection@0.8.0
  - @zag-js/dom-event@0.8.0

## 0.7.0

### Patch Changes

- [`e0b75aad`](https://github.com/chakra-ui/zag/commit/e0b75aad7a4ac4035e55f2ac060f6a86293b9252) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Export types for color channel and swatch parts

- [`d3c11c51`](https://github.com/chakra-ui/zag/commit/d3c11c510dedda6d86159ed7e5736d9e7083c028) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure ids of underlying elements can customized based on `ids`
  context property.

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.6.0

### Minor Changes

- [#601](https://github.com/chakra-ui/zag/pull/601)
  [`657df96e`](https://github.com/chakra-ui/zag/commit/657df96e0fbc59dcab8d06eb90105519d32b527f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release of the color utilities and picker.

### Patch Changes

- Updated dependencies [[`657df96e`](https://github.com/chakra-ui/zag/commit/657df96e0fbc59dcab8d06eb90105519d32b527f),
  [`657df96e`](https://github.com/chakra-ui/zag/commit/657df96e0fbc59dcab8d06eb90105519d32b527f)]:
  - @zag-js/dom-event@0.6.0
  - @zag-js/color-utils@0.6.0
