# @zag-js/field

## 2.0.0-next.2

### Minor Changes

- [#3252](https://github.com/chakra-ui/zag/pull/3252)
  [`2ac7fb1`](https://github.com/chakra-ui/zag/commit/2ac7fb1122756ac5ba02bd6c8a26b73fa2e26693) Thanks
  [@github-actions](https://github.com/apps/github-actions)! - Add `@zag-js/field`. Label, describe, and validate a
  native input, textarea, or select from one machine.

  It tracks `touched`, `dirty`, `filled`, and `focused` from the control. Pass `dirty` or `touched` when a form library
  already owns those flags.

  Errors come from native `ValidityState` or your `validate` function (sync or async). `validationMode` chooses when
  they show: `onSubmit` (default), `onBlur`, or `onChange`. An empty required field stays quiet until the user edits it
  or submits.

  A field with several controls sets `target` to the item the label and validity own, and passes `{ item }` on
  `getInputProps` / `getSelectProps` for each sibling.

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
