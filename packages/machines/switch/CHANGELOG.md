# @zag-js/switch

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
