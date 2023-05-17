# @zag-js/checkbox

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

- [`669e2a4e`](https://github.com/chakra-ui/zag/commit/669e2a4e680adc860cc901251039169b5956fe97) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machines to wire out state and transitions correctly

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.8.0

### Patch Changes

- [`c673547c`](https://github.com/chakra-ui/zag/commit/c673547c211739b88375e3bc546a45a7b577bded) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove `readOnly` property from checkbox, it is not supported in
  native checkbox element.

- [`41550949`](https://github.com/chakra-ui/zag/commit/41550949e16b9f4879b89ed7e3658271912ebfaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor checkbox machine to fix transition bugs in controlled
  mode.

## 0.7.0

### Patch Changes

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.6.0

### Patch Changes

- [`78f64795`](https://github.com/chakra-ui/zag/commit/78f64795f94c6e25205ffac4c8ada2efed6406ac) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where checkbox `toggleChecked` was not defined

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

## 0.2.16

### Patch Changes

- [`7c56fc43`](https://github.com/chakra-ui/zag/commit/7c56fc43f6a532754e9ad0144715b57c56a790ee) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where shows console warning due to `preventDefault` call
  in pointer event on mobile

- Updated dependencies [[`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0)]:
  - @zag-js/utils@0.3.4
  - @zag-js/core@0.2.12

## 0.2.15

### Patch Changes

- [#556](https://github.com/chakra-ui/zag/pull/556)
  [`65292bd2`](https://github.com/chakra-ui/zag/commit/65292bd2a892b5659287438d125ce2bbf930987e) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix typo in `interactive` JS Doc description.

- Updated dependencies [[`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2)]:
  - @zag-js/core@0.2.11

## 0.2.14

### Patch Changes

- Updated dependencies [[`1446d88b`](https://github.com/chakra-ui/zag/commit/1446d88bff3848f2a2ec0a793ee83281cda966e8)]:
  - @zag-js/dom-query@0.1.4

## 0.2.13

### Patch Changes

- [#516](https://github.com/chakra-ui/zag/pull/516)
  [`d6c15603`](https://github.com/chakra-ui/zag/commit/d6c15603bfcaf00fc0244a6c5ac7c3f742a8d878) Thanks
  [@visualjerk](https://github.com/visualjerk)! - Fix issue where double clicking outside breaks a new click on checkbox
  label

- [#517](https://github.com/chakra-ui/zag/pull/517)
  [`9f22e88d`](https://github.com/chakra-ui/zag/commit/9f22e88d3f99cefa36214187600cd5036e6b343f) Thanks
  [@visualjerk](https://github.com/visualjerk)! - Fixed issue where input element triggers `onBlur` when clicking the
  checkbox label.

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

- Updated dependencies [[`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99)]:
  - @zag-js/visually-hidden@0.0.1
  - @zag-js/form-utils@0.2.5
  - @zag-js/dom-query@0.1.3
  - @zag-js/core@0.2.10

## 0.2.12

### Patch Changes

- Updated dependencies [[`df27f257`](https://github.com/chakra-ui/zag/commit/df27f257f53d194013b528342d3d9aef994d0d5c)]:
  - @zag-js/core@0.2.9

## 0.2.11

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.2.8

## 0.2.10

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

- Updated dependencies [[`f7bb988a`](https://github.com/chakra-ui/zag/commit/f7bb988aaeda6c6caebe95823f4cd44baa0d5e78),
  [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7),
  [`fef822b9`](https://github.com/chakra-ui/zag/commit/fef822b91a4a9dbfc3c1e8f88a89727a3231326a)]:
  - @zag-js/core@0.2.7
  - @zag-js/anatomy@0.1.4
  - @zag-js/types@0.3.4

## 0.2.9

### Patch Changes

- Updated dependencies [[`80de0b7c`](https://github.com/chakra-ui/zag/commit/80de0b7c7f888a254a3e1fec2da5338e235bc699)]:
  - @zag-js/core@0.2.6

## 0.2.8

### Patch Changes

- Updated dependencies [[`c1f609df`](https://github.com/chakra-ui/zag/commit/c1f609dfabbc31c296ebdc1e89480313130f832b),
  [`c7e85e20`](https://github.com/chakra-ui/zag/commit/c7e85e20d4d08b56852768becf2fc5f7f4275dcc)]:
  - @zag-js/types@0.3.3
  - @zag-js/core@0.2.5

## 0.2.7

### Patch Changes

- [#462](https://github.com/chakra-ui/zag/pull/462)
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update packages to use explicit `exports` field in `package.json`

- Updated dependencies [[`4c98f016`](https://github.com/chakra-ui/zag/commit/4c98f016ae3d48b1b74f4dc8c302ef9a1c664260),
  [`ec776276`](https://github.com/chakra-ui/zag/commit/ec77627603f310ca34a659bc250cdcf819a17b91),
  [`f8c47a2b`](https://github.com/chakra-ui/zag/commit/f8c47a2b4442bfadc4d98315a8c1ac4aa4020822),
  [`5799fcb5`](https://github.com/chakra-ui/zag/commit/5799fcb520a7956dc7ef1a9bc7aaa8dff85fa592)]:
  - @zag-js/core@0.2.4
  - @zag-js/anatomy@0.1.3
  - @zag-js/types@0.3.2

## 0.2.6

### Patch Changes

- Updated dependencies [[`5bd24f02`](https://github.com/chakra-ui/zag/commit/5bd24f02fcab355f7df8a2d5cea3b155155380f8)]:
  - @zag-js/anatomy@0.1.2

## 0.2.5

### Patch Changes

- [`af4ab9bb`](https://github.com/chakra-ui/zag/commit/af4ab9bb7cd599c53e47ca7ed2ea90a4ff742499) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update anatomy of components

- Updated dependencies [[`9d936614`](https://github.com/chakra-ui/zag/commit/9d93661439f10a550c154e9f290905d32e8f509b)]:
  - @zag-js/core@0.2.3

## 0.2.4

### Patch Changes

- [#407](https://github.com/chakra-ui/zag/pull/407)
  [`5936094a`](https://github.com/chakra-ui/zag/commit/5936094ae61896c9ac58d541660d08e351626f7b) Thanks
  [@malangcat](https://github.com/malangcat)! - Fix issue where `onChange` is called with incorrect state

- [#413](https://github.com/chakra-ui/zag/pull/413)
  [`38f2daf8`](https://github.com/chakra-ui/zag/commit/38f2daf8600afc517e2d40f40249925c137fbc0a) Thanks
  [@malangcat](https://github.com/malangcat)! - Use aria-readonly instead of readOnly attribute. `readonly` attribute
  only applies to text inputs, not checkboxes and radios according to the
  [HTML spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)

- [#414](https://github.com/chakra-ui/zag/pull/414)
  [`7fe62689`](https://github.com/chakra-ui/zag/commit/7fe62689a467bdacf90ff30b155b12c87475f3c6) Thanks
  [@malangcat](https://github.com/malangcat)! - remove unused aria-invalid property in PublicContext

- [#416](https://github.com/chakra-ui/zag/pull/416)
  [`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Describe the anatomy of a machine and use it to generate data-scope
  and data-part

- [#408](https://github.com/chakra-ui/zag/pull/408)
  [`62cf9e5f`](https://github.com/chakra-ui/zag/commit/62cf9e5f87eaf928d3e66fb9146f6dc70d7ee50b) Thanks
  [@malangcat](https://github.com/malangcat)! - Remove `aria-checked` and `aria-disabled` from checkbox input part.
  Based on recent [spec](w3c.github.io/html-aria/#att-checked), those attributes should be applied to native input
  elements.

- [#415](https://github.com/chakra-ui/zag/pull/415)
  [`c0eefbc2`](https://github.com/chakra-ui/zag/commit/c0eefbc258fd5bb6127fd652df6d3219632bd18e) Thanks
  [@anubra266](https://github.com/anubra266)! - Move html `for` attribute to `rootProps` so it targets label elements.

- Updated dependencies [[`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b)]:
  - @zag-js/anatomy@0.1.1

## 0.2.3

### Patch Changes

- [#400](https://github.com/chakra-ui/zag/pull/400)
  [`29f24231`](https://github.com/chakra-ui/zag/commit/29f242317df9fff2af04b83b618f6577cbdbb713) Thanks
  [@anubra266](https://github.com/anubra266)! - Add support for `form` attribute

- [`985d9b26`](https://github.com/chakra-ui/zag/commit/985d9b26a9db7e585ff504bbaa88de6835cf3fd0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure consistent API naming for `readonly` by renaming it to
  `readOnly`

- [#398](https://github.com/chakra-ui/zag/pull/398)
  [`5706d503`](https://github.com/chakra-ui/zag/commit/5706d5036db101ec7fd6dcb9a9065461aad0225c) Thanks
  [@anubra266](https://github.com/anubra266)! - Refactor machine to simplify form-utils approach

## 0.2.2

### Patch Changes

- Updated dependencies [[`44feef0b`](https://github.com/chakra-ui/zag/commit/44feef0bdf312e27d6faf1aa8ab0ecff0281108c),
  [`810e7d85`](https://github.com/chakra-ui/zag/commit/810e7d85274a26e0fe76dbdb2829fd7ab7f982a6),
  [`e328b306`](https://github.com/chakra-ui/zag/commit/e328b306bf06d151fff4907a7e8e1160f07af855),
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999)]:
  - @zag-js/core@0.2.2
  - @zag-js/types@0.3.1

## 0.2.1

### Patch Changes

- [#381](https://github.com/chakra-ui/zag/pull/381)
  [`21775db5`](https://github.com/chakra-ui/zag/commit/21775db5ac318b095f603e7030ec7645e104f663) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Omit undefined values passed in machine's context

- Updated dependencies [[`4aa6955f`](https://github.com/chakra-ui/zag/commit/4aa6955fab7ff6fee8545dcf491576640c69c64e)]:
  - @zag-js/core@0.2.1

## 0.2.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

### Patch Changes

- Updated dependencies [[`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca)]:
  - @zag-js/core@0.2.0
  - @zag-js/types@0.3.0

## 0.1.8

### Patch Changes

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

- Updated dependencies [[`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7)]:
  - @zag-js/core@0.1.12
  - @zag-js/types@0.2.7

## 0.1.7

### Patch Changes

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

- Updated dependencies [[`61c11646`](https://github.com/chakra-ui/zag/commit/61c116467c1758bdda7efe1f27d4ed26e7d44624),
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538)]:
  - @zag-js/core@0.1.11
  - @zag-js/types@0.2.6

## 0.1.6

### Patch Changes

- [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Bump all packages

- Updated dependencies [[`ce97956c`](https://github.com/chakra-ui/zag/commit/ce97956c0586ce842f7b082dd71cc6d68909ad58),
  [`55e6a55c`](https://github.com/chakra-ui/zag/commit/55e6a55c37a60eea5caa446270cd1f6012d7363d)]:
  - @zag-js/core@0.1.10
  - @zag-js/types@0.2.5

## 0.1.5

### Patch Changes

- Updated dependencies [[`1d30333e`](https://github.com/chakra-ui/zag/commit/1d30333e0d3011707950adab26878cde9ed1c242)]:
  - @zag-js/types@0.2.4

## 0.1.4

### Patch Changes

- [#247](https://github.com/chakra-ui/zag/pull/247)
  [`b3c768cd`](https://github.com/chakra-ui/zag/commit/b3c768cd8605c8964acc966d29075e1f845ee0ff) Thanks
  [@anubra266](https://github.com/anubra266)! - Refactor form utilitities into new package

## 0.1.3

### Patch Changes

- [`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Trigger new version due to changes in build chain

- Updated dependencies [[`2a2566b8`](https://github.com/chakra-ui/zag/commit/2a2566b8be1441ae98215bec594e4c996f3b8aaf)]:
  - @zag-js/core@0.1.9
  - @zag-js/types@0.2.3

## 0.1.2

### Patch Changes

- [#202](https://github.com/chakra-ui/zag/pull/202)
  [`ef8a7386`](https://github.com/chakra-ui/zag/commit/ef8a7386ccf4de3431c785b310670da105788597) Thanks
  [@anubra266](https://github.com/anubra266)! - Refactor machine dom to use `getById`

* [#191](https://github.com/chakra-ui/zag/pull/191)
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b) Thanks
  [@anubra266](https://github.com/anubra266)! - Improve SSR by omitting the setup step.

* Updated dependencies [[`0e750fa1`](https://github.com/chakra-ui/zag/commit/0e750fa1e8d17f495f7d9fda10385819ac762c7b),
  [`66cb9c99`](https://github.com/chakra-ui/zag/commit/66cb9c998662fd049590d51cfdcd79f03e2f582b),
  [`c5872be2`](https://github.com/chakra-ui/zag/commit/c5872be2fe057675fb8c7c64ed2c10b99daf697e)]:
  - @zag-js/types@0.2.2
  - @zag-js/core@0.1.8

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
