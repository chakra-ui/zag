# @zag-js/checkbox

## 0.1.1

### Patch Changes

- [#178](https://github.com/chakra-ui/zag/pull/178)
  [`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING 💥: Refactor connect function in favor of uniform APIs
  across frameworks

  Due to the fact that we tried to make "React" the baseline, there was a lot of inherent complexity in how we managed
  types in the codebase.

  We've now removed the `PropTypes` export in favor of passing `normalizeProps` in the `api.connect` function. This is
  now required for React as well.

  You can remove the `<PropTypes>` generic and Zag will auto-infer the types from `normalizeProps`.

  **For Vue and Solid**

  ```diff
  -api.connect<PropTypes>(state, send, normalizeProps)
  +api.connect(state, send, normalizeProps)
  ```

  **For React**

  ```diff
  -api.connect(state, send)
  +api.connect(state, send, normalizeProps)
  ```

* [`a1c04956`](https://github.com/chakra-ui/zag/commit/a1c049568a49781296cfad869bc6f2abb620615e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor to use tags
  - Update `inputProps` to use `defaultChecked` instead of `checked` for progressive enhancement

- [`ef0c29cf`](https://github.com/chakra-ui/zag/commit/ef0c29cfa874f2fc990872f319affae023bb7cd4) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump versions

* [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine and connect

* Updated dependencies [[`1abed11b`](https://github.com/chakra-ui/zag/commit/1abed11bda7fc56fd3f77c3b842e89a934ee3253),
  [`3a53a1e9`](https://github.com/chakra-ui/zag/commit/3a53a1e97306a9fedf1706b95f8e38b03750c2f3)]:
  - @zag-js/core@0.1.7
  - @zag-js/types@0.2.1

## 0.1.0

### Minor Changes

- [#130](https://github.com/chakra-ui/zag/pull/130)
  [`0d2911af`](https://github.com/chakra-ui/zag/commit/0d2911af381bacc9151845e5312f62a5aa2999b2) Thanks
  [@anubra266](https://github.com/anubra266)! - Added new checkbox component

### Patch Changes

- Updated dependencies [[`01a4a520`](https://github.com/chakra-ui/zag/commit/01a4a520abdc2ec88b205acee6d1b25265d5fd3f),
  [`0d2911af`](https://github.com/chakra-ui/zag/commit/0d2911af381bacc9151845e5312f62a5aa2999b2)]:
  - @zag-js/dom-utils@0.1.5
  - @zag-js/types@0.2.0
