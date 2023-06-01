# @zag-js/switch

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.2
  - @zag-js/core@0.10.2
  - @zag-js/types@0.10.2
  - @zag-js/utils@0.10.2
  - @zag-js/dom-query@0.10.2
  - @zag-js/form-utils@0.10.2
  - @zag-js/visually-hidden@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.1
  - @zag-js/core@0.10.1
  - @zag-js/types@0.10.1
  - @zag-js/utils@0.10.1
  - @zag-js/dom-query@0.10.1
  - @zag-js/form-utils@0.10.1
  - @zag-js/visually-hidden@0.10.1

## 0.10.0

### Patch Changes

- [`be223fbe`](https://github.com/chakra-ui/zag/commit/be223fbecf49ca3587c975289f4da867dc0d9a16) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where Checkbox and Switch emits `onClick` twice when
  parent element is clicked

- [#665](https://github.com/chakra-ui/zag/pull/665)
  [`f6c81e90`](https://github.com/chakra-ui/zag/commit/f6c81e9096a43b482cc24aa6325a1ae24fd43498) Thanks
  [@ongyuxing](https://github.com/ongyuxing)! - Fix issue where `setChecked` doesn't work

- Updated dependencies [[`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da),
  [`d2838286`](https://github.com/chakra-ui/zag/commit/d2838286fc13acae3f0818653d5feee982703f23),
  [`2a1fb4a0`](https://github.com/chakra-ui/zag/commit/2a1fb4a0740e6ad8e2902265e14597f087007675),
  [`a30258e8`](https://github.com/chakra-ui/zag/commit/a30258e8137bfba5811471919e463b79039848b6)]:
  - @zag-js/dom-query@0.10.0
  - @zag-js/anatomy@0.10.0
  - @zag-js/types@0.10.0
  - @zag-js/core@0.10.0
  - @zag-js/utils@0.10.0
  - @zag-js/form-utils@0.10.0
  - @zag-js/visually-hidden@0.10.0

## 0.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.9.2
  - @zag-js/core@0.9.2
  - @zag-js/types@0.9.2
  - @zag-js/utils@0.9.2
  - @zag-js/dom-query@0.9.2
  - @zag-js/form-utils@0.9.2
  - @zag-js/visually-hidden@0.9.2

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
  - @zag-js/form-utils@0.9.1
  - @zag-js/visually-hidden@0.9.1

## 0.9.0

### Patch Changes

- [`a1cccb88`](https://github.com/chakra-ui/zag/commit/a1cccb889afbf60d03c27dcde14a1de2b57ca9d6) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove unused attributes and make it consistent with checkbox

- [`669e2a4e`](https://github.com/chakra-ui/zag/commit/669e2a4e680adc860cc901251039169b5956fe97) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machines to wire out state and transitions correctly

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.8.0

### Patch Changes

- [#629](https://github.com/chakra-ui/zag/pull/629)
  [`ec44e039`](https://github.com/chakra-ui/zag/commit/ec44e03941628f28b3799f8278a90355f1d73dcf) Thanks
  [@junghyeonsu](https://github.com/junghyeonsu)! - Refactor switch machine to fix transition bugs in controlled mode.

## 0.7.0

### Patch Changes

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.5.0

### Minor Changes

- [`1bf5f282`](https://github.com/chakra-ui/zag/commit/1bf5f2822f38c5ccde0e6ef0ce104ba263330195) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove the `defaultChecked` property in favor of the `checked`
  property that can now be controlled.

  ```jsx
  // the checkbox will be checked initially
  const [state, send] = useMachine(
    checkbox.machine({
      id: "1",
      checked: true,
    }),
  )

  // this will update the checkbox when the `checked` value changes
  const [state, send] = useMachine(checkbox.machine({ id: "1" }), {
    context: {
      // when this value changes, the checkbox will be checked/unchecked
      checked: true,
    },
  })
  ```

### Patch Changes

- Updated dependencies [[`ec07ff35`](https://github.com/chakra-ui/zag/commit/ec07ff3590916ebcb4450b64207370ee2af9d3d1),
  [`54377b1c`](https://github.com/chakra-ui/zag/commit/54377b1c4ed85deb06453a00648b7c2c1f0c72df)]:
  - @zag-js/core@0.5.0
  - @zag-js/types@0.5.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0)]:
  - @zag-js/utils@0.3.4
  - @zag-js/core@0.2.12

## 0.1.0

### Minor Changes

- [#557](https://github.com/chakra-ui/zag/pull/557)
  [`3727031e`](https://github.com/chakra-ui/zag/commit/3727031e0c56c7623fe6f0eb75e6b16efa3556e4) Thanks
  [@anubra266](https://github.com/anubra266)! - Add new switch machine

### Patch Changes

- Updated dependencies [[`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2)]:
  - @zag-js/core@0.2.11
