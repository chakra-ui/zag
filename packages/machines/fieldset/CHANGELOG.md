# @zag-js/fieldset

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.5
  - @zag-js/core@2.0.0-next.5
  - @zag-js/types@2.0.0-next.5
  - @zag-js/utils@2.0.0-next.5
  - @zag-js/dom-query@2.0.0-next.5

## 2.0.0-next.4

### Minor Changes

- [#3342](https://github.com/chakra-ui/zag/pull/3342)
  [`d6089c3`](https://github.com/chakra-ui/zag/commit/d6089c3f31a0952f7f35a0b8c08427770b43aac9) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - - Remove `aria-invalid` from the root, which its role
  doesn't support. `data-invalid` stays for styling.

  - Remove `aria-live` from the error text.

  - Only set `aria-labelledby` while a legend is rendered.

  - Fix controls not picking up the disabled state from a fieldset further up the tree.

### Patch Changes

- Updated dependencies [[`a80b307`](https://github.com/chakra-ui/zag/commit/a80b307d3d81c1b1ee22cd1049343dbc2f877633)]:
  - @zag-js/dom-query@2.0.0-next.4
  - @zag-js/core@2.0.0-next.4
  - @zag-js/anatomy@2.0.0-next.4
  - @zag-js/types@2.0.0-next.4
  - @zag-js/utils@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@2.0.0-next.3
  - @zag-js/core@2.0.0-next.3
  - @zag-js/types@2.0.0-next.3
  - @zag-js/utils@2.0.0-next.3
  - @zag-js/dom-query@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`2ac7fb1`](https://github.com/chakra-ui/zag/commit/2ac7fb1122756ac5ba02bd6c8a26b73fa2e26693) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/fieldset` for a native `<fieldset>` with a
  legend, helper text, and error text.

  Disabled includes inheritance from an ancestor fieldset. Disabling the fieldset disables the fields inside it.

### Patch Changes

- Updated dependencies [[`2668edc`](https://github.com/chakra-ui/zag/commit/2668edc73d4179656b0f56e3cb91c5d009be2ee4),
  [`06ddeb3`](https://github.com/chakra-ui/zag/commit/06ddeb3a01fb418cdfcb583b5e7e2308cc378b05),
  [`6d57458`](https://github.com/chakra-ui/zag/commit/6d57458038a2e05a93a162948c0260d423560f17),
  [`734b5e8`](https://github.com/chakra-ui/zag/commit/734b5e8e43f03402f5c3d0c283a79d4615e4868b),
  [`e8b99d2`](https://github.com/chakra-ui/zag/commit/e8b99d2af940821a1ff34d086d5f0910c187ec4f),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb),
  [`2859ef6`](https://github.com/chakra-ui/zag/commit/2859ef675d0b58fc485ef83f040c5feb6ec216bb)]:
  - @zag-js/dom-query@2.0.0-next.2
  - @zag-js/core@2.0.0-next.2
  - @zag-js/types@2.0.0-next.2
  - @zag-js/utils@2.0.0-next.2
  - @zag-js/anatomy@2.0.0-next.2
