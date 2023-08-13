# @zag-js/select

## 0.16.0

### Patch Changes

- [`eca3fb6b`](https://github.com/chakra-ui/zag/commit/eca3fb6b05f6701db677026658b4cbf2e14e9e33) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where interaction outside and positioning does not work
  when select content is conditionally rendered

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dismissable@0.16.0
  - @zag-js/dom-event@0.16.0
  - @zag-js/dom-query@0.16.0
  - @zag-js/form-utils@0.16.0
  - @zag-js/mutation-observer@0.16.0
  - @zag-js/popper@0.16.0
  - @zag-js/tabbable@0.16.0
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
  - @zag-js/utils@0.15.0
  - @zag-js/dismissable@0.15.0
  - @zag-js/dom-event@0.15.0
  - @zag-js/dom-query@0.15.0
  - @zag-js/form-utils@0.15.0
  - @zag-js/mutation-observer@0.15.0
  - @zag-js/popper@0.15.0
  - @zag-js/tabbable@0.15.0
  - @zag-js/visually-hidden@0.15.0

## 0.14.0

### Minor Changes

- [`fbe6f586`](https://github.com/chakra-ui/zag/commit/fbe6f58622241fa7fa6a93dfd7d2cea842f31cb3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Forward outside interaction event handlers
  (`onPointerdownOutside`, `onFocusOutside` and `onInteractOutside`) in relevant machines.

  This can be useful to allow interacting on certain elements outside the content element of the machine, like browser
  extensions.

  > Affected machines, `combobox`, `editable`, `menu`, `select`, `tags-input`.

### Patch Changes

- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/dismissable@0.14.0
  - @zag-js/popper@0.14.0
  - @zag-js/tabbable@0.14.0
  - @zag-js/dom-event@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/utils@0.14.0
  - @zag-js/form-utils@0.14.0
  - @zag-js/mutation-observer@0.14.0
  - @zag-js/visually-hidden@0.14.0

## 0.13.0

### Patch Changes

- [`e2cb53c7`](https://github.com/chakra-ui/zag/commit/e2cb53c7c7a9dc2b1d462ad4e85d25f7e718d848) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `sameWidth` doesn't work consistently in Vue.js
  and Solid.js during re-render.

- Updated dependencies [[`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414),
  [`e2cb53c7`](https://github.com/chakra-ui/zag/commit/e2cb53c7c7a9dc2b1d462ad4e85d25f7e718d848)]:
  - @zag-js/core@0.13.0
  - @zag-js/popper@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dismissable@0.13.0
  - @zag-js/dom-event@0.13.0
  - @zag-js/dom-query@0.13.0
  - @zag-js/form-utils@0.13.0
  - @zag-js/mutation-observer@0.13.0
  - @zag-js/tabbable@0.13.0
  - @zag-js/visually-hidden@0.13.0

## 0.12.0

### Minor Changes

- [`72946ada`](https://github.com/chakra-ui/zag/commit/72946ada6d247fcd3442ca3b76b9f3db2d985e38) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-state` attribute to allow styling the open/closed state
  or checked/unchecked states

  **Potential breaking change:**

  We replaced `data-expanded` or `data-checked` to `data-state` attribute

  - `data-expanded` maps to `data-state="open"` or `data-state="closed"`
  - `data-checked` maps to `data-state="checked"` or `data-state="unchecked"`
  - `data-indeterminate` maps to `data-state="indeterminate"`
  - `data-open` maps to `data-state="open"`

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.12.0
  - @zag-js/core@0.12.0
  - @zag-js/types@0.12.0
  - @zag-js/utils@0.12.0
  - @zag-js/dismissable@0.12.0
  - @zag-js/dom-event@0.12.0
  - @zag-js/dom-query@0.12.0
  - @zag-js/form-utils@0.12.0
  - @zag-js/mutation-observer@0.12.0
  - @zag-js/popper@0.12.0
  - @zag-js/tabbable@0.12.0
  - @zag-js/visually-hidden@0.12.0

## 0.11.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.11.2
  - @zag-js/core@0.11.2
  - @zag-js/types@0.11.2
  - @zag-js/utils@0.11.2
  - @zag-js/dismissable@0.11.2
  - @zag-js/dom-event@0.11.2
  - @zag-js/dom-query@0.11.2
  - @zag-js/form-utils@0.11.2
  - @zag-js/mutation-observer@0.11.2
  - @zag-js/popper@0.11.2
  - @zag-js/tabbable@0.11.2
  - @zag-js/visually-hidden@0.11.2

## 0.11.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.11.1
  - @zag-js/core@0.11.1
  - @zag-js/types@0.11.1
  - @zag-js/utils@0.11.1
  - @zag-js/dismissable@0.11.1
  - @zag-js/dom-event@0.11.1
  - @zag-js/dom-query@0.11.1
  - @zag-js/form-utils@0.11.1
  - @zag-js/mutation-observer@0.11.1
  - @zag-js/popper@0.11.1
  - @zag-js/tabbable@0.11.1
  - @zag-js/visually-hidden@0.11.1

## 0.11.0

### Patch Changes

- [`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rebuild all packages using tsup

- Updated dependencies [[`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce)]:
  - @zag-js/mutation-observer@0.11.0
  - @zag-js/visually-hidden@0.11.0
  - @zag-js/dismissable@0.11.0
  - @zag-js/form-utils@0.11.0
  - @zag-js/dom-event@0.11.0
  - @zag-js/dom-query@0.11.0
  - @zag-js/tabbable@0.11.0
  - @zag-js/popper@0.11.0
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
  - @zag-js/dismissable@0.10.5
  - @zag-js/dom-event@0.10.5
  - @zag-js/dom-query@0.10.5
  - @zag-js/form-utils@0.10.5
  - @zag-js/mutation-observer@0.10.5
  - @zag-js/popper@0.10.5
  - @zag-js/tabbable@0.10.5
  - @zag-js/visually-hidden@0.10.5

## 0.10.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.4
  - @zag-js/core@0.10.4
  - @zag-js/types@0.10.4
  - @zag-js/utils@0.10.4
  - @zag-js/dismissable@0.10.4
  - @zag-js/dom-event@0.10.4
  - @zag-js/dom-query@0.10.4
  - @zag-js/form-utils@0.10.4
  - @zag-js/mutation-observer@0.10.4
  - @zag-js/popper@0.10.4
  - @zag-js/tabbable@0.10.4
  - @zag-js/visually-hidden@0.10.4

## 0.10.3

### Patch Changes

- [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Use vite to build packages

- Updated dependencies [[`6344f8a1`](https://github.com/chakra-ui/zag/commit/6344f8a11aa0f6d5f633431ce47519d74e35b62b),
  [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7),
  [`775f11c9`](https://github.com/chakra-ui/zag/commit/775f11c96759197fcbad14b5b8a0fbde095efc55)]:
  - @zag-js/popper@0.10.3
  - @zag-js/anatomy@0.10.3
  - @zag-js/core@0.10.3
  - @zag-js/types@0.10.3
  - @zag-js/utils@0.10.3
  - @zag-js/dismissable@0.10.3
  - @zag-js/dom-event@0.10.3
  - @zag-js/dom-query@0.10.3
  - @zag-js/form-utils@0.10.3
  - @zag-js/mutation-observer@0.10.3
  - @zag-js/tabbable@0.10.3
  - @zag-js/visually-hidden@0.10.3

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.2
  - @zag-js/core@0.10.2
  - @zag-js/types@0.10.2
  - @zag-js/utils@0.10.2
  - @zag-js/dismissable@0.10.2
  - @zag-js/dom-event@0.10.2
  - @zag-js/dom-query@0.10.2
  - @zag-js/form-utils@0.10.2
  - @zag-js/mutation-observer@0.10.2
  - @zag-js/popper@0.10.2
  - @zag-js/tabbable@0.10.2
  - @zag-js/visually-hidden@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.1
  - @zag-js/core@0.10.1
  - @zag-js/types@0.10.1
  - @zag-js/utils@0.10.1
  - @zag-js/dismissable@0.10.1
  - @zag-js/dom-event@0.10.1
  - @zag-js/dom-query@0.10.1
  - @zag-js/form-utils@0.10.1
  - @zag-js/mutation-observer@0.10.1
  - @zag-js/popper@0.10.1
  - @zag-js/tabbable@0.10.1
  - @zag-js/visually-hidden@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`dbc13547`](https://github.com/chakra-ui/zag/commit/dbc13547deeef869640f637f3c0affab8fb82c17),
  [`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da),
  [`d2838286`](https://github.com/chakra-ui/zag/commit/d2838286fc13acae3f0818653d5feee982703f23),
  [`2a1fb4a0`](https://github.com/chakra-ui/zag/commit/2a1fb4a0740e6ad8e2902265e14597f087007675),
  [`a30258e8`](https://github.com/chakra-ui/zag/commit/a30258e8137bfba5811471919e463b79039848b6)]:
  - @zag-js/dom-event@0.10.0
  - @zag-js/dom-query@0.10.0
  - @zag-js/anatomy@0.10.0
  - @zag-js/types@0.10.0
  - @zag-js/dismissable@0.10.0
  - @zag-js/popper@0.10.0
  - @zag-js/tabbable@0.10.0
  - @zag-js/core@0.10.0
  - @zag-js/utils@0.10.0
  - @zag-js/form-utils@0.10.0
  - @zag-js/mutation-observer@0.10.0
  - @zag-js/visually-hidden@0.10.0

## 0.9.2

### Patch Changes

- Updated dependencies [[`280015e3`](https://github.com/chakra-ui/zag/commit/280015e36539f23731cba09a28e1371d5760b8b4)]:
  - @zag-js/dom-event@0.9.2
  - @zag-js/dismissable@0.9.2
  - @zag-js/anatomy@0.9.2
  - @zag-js/core@0.9.2
  - @zag-js/types@0.9.2
  - @zag-js/utils@0.9.2
  - @zag-js/dom-query@0.9.2
  - @zag-js/form-utils@0.9.2
  - @zag-js/mutation-observer@0.9.2
  - @zag-js/popper@0.9.2
  - @zag-js/tabbable@0.9.2
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
  - @zag-js/dismissable@0.9.1
  - @zag-js/dom-event@0.9.1
  - @zag-js/dom-query@0.9.1
  - @zag-js/form-utils@0.9.1
  - @zag-js/mutation-observer@0.9.1
  - @zag-js/popper@0.9.1
  - @zag-js/tabbable@0.9.1
  - @zag-js/visually-hidden@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [[`fb4fb42d`](https://github.com/chakra-ui/zag/commit/fb4fb42d8aacc5844945dd7b1bd27b94c978ca4e)]:
  - @zag-js/dismissable@0.8.0
  - @zag-js/tabbable@0.8.0
  - @zag-js/popper@0.8.0
  - @zag-js/dom-event@0.8.0

## 0.7.0

### Patch Changes

- [`d3c11c51`](https://github.com/chakra-ui/zag/commit/d3c11c510dedda6d86159ed7e5736d9e7083c028) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure ids of underlying elements can customized based on `ids`
  context property.

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`657df96e`](https://github.com/chakra-ui/zag/commit/657df96e0fbc59dcab8d06eb90105519d32b527f)]:
  - @zag-js/dom-event@0.6.0
  - @zag-js/dismissable@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies [[`ec07ff35`](https://github.com/chakra-ui/zag/commit/ec07ff3590916ebcb4450b64207370ee2af9d3d1),
  [`54377b1c`](https://github.com/chakra-ui/zag/commit/54377b1c4ed85deb06453a00648b7c2c1f0c72df)]:
  - @zag-js/core@0.5.0
  - @zag-js/types@0.5.0
  - @zag-js/dom-event@0.5.0
  - @zag-js/dismissable@0.5.0

## 0.2.1

### Patch Changes

- [`33d96b0d`](https://github.com/chakra-ui/zag/commit/33d96b0d927868a17d0e8e0298d5b34e82eed540) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve keyboard accessibility by managing focus between the
  content, trigger and other tabbable elements in the natural DOM order.
- Updated dependencies [[`fa2ecc8e`](https://github.com/chakra-ui/zag/commit/fa2ecc8ea235b824f45deda10070c321f896886c),
  [`33d96b0d`](https://github.com/chakra-ui/zag/commit/33d96b0d927868a17d0e8e0298d5b34e82eed540),
  [`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0)]:
  - @zag-js/popper@0.2.7
  - @zag-js/tabbable@0.1.1
  - @zag-js/utils@0.3.4
  - @zag-js/core@0.2.12
  - @zag-js/dismissable@0.2.6

## 0.2.0

### Minor Changes

- [#553](https://github.com/chakra-ui/zag/pull/553)
  [`3ed0e554`](https://github.com/chakra-ui/zag/commit/3ed0e554a2a5f12bfdcf746eff6055b77b24c604) Thanks
  [@visualjerk](https://github.com/visualjerk)! - Add `onInteractOutside` hook to context.

  This can be used to prevent loosing focus when composing with other components.

  Example usage:

  ```ts
  {
    onInteractOutside(event) {
      // Prevent loosing focus when interacting with related popup
      if (popupElement.contains(event.target)) {
        event.preventDefault()
      }
    }
  }
  ```

### Patch Changes

- [`65cbba78`](https://github.com/chakra-ui/zag/commit/65cbba78b4ebe2d4bdf661afc21147edf9b7a96c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor select to use dismissable layer pattern

- [`9d4db09e`](https://github.com/chakra-ui/zag/commit/9d4db09e1b31b4f5bd85a04622359b3312171741) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where machine throws when the trigger or content element
  is not in the DOM.

- Updated dependencies [[`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2),
  [`fefa5098`](https://github.com/chakra-ui/zag/commit/fefa5098f400ee6b04e5636c8b0b016dca5b2360),
  [`9d4db09e`](https://github.com/chakra-ui/zag/commit/9d4db09e1b31b4f5bd85a04622359b3312171741)]:
  - @zag-js/core@0.2.11
  - @zag-js/popper@0.2.6
  - @zag-js/dismissable@0.2.5

## 0.1.14

### Patch Changes

- Updated dependencies [[`1446d88b`](https://github.com/chakra-ui/zag/commit/1446d88bff3848f2a2ec0a793ee83281cda966e8),
  [`f55fc3a0`](https://github.com/chakra-ui/zag/commit/f55fc3a01ab7b95ac29caf41eaeac4033b00e1be)]:
  - @zag-js/dom-query@0.1.4
  - @zag-js/interact-outside@0.2.4
  - @zag-js/popper@0.2.5

## 0.1.13

### Patch Changes

- [#539](https://github.com/chakra-ui/zag/pull/539)
  [`240b0340`](https://github.com/chakra-ui/zag/commit/240b0340ed87a2572552dc8de19470a5f1c46e35) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where element triggers double click events due to the
  internal `.click()` calls

## 0.1.12

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

- Updated dependencies [[`58078617`](https://github.com/chakra-ui/zag/commit/58078617637c22756497cb6e1d90618586e55687),
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99),
  [`5277f653`](https://github.com/chakra-ui/zag/commit/5277f65311c46e5792f605021d58b3b7e7dc3eaa)]:
  - @zag-js/interact-outside@0.2.3
  - @zag-js/mutation-observer@0.0.1
  - @zag-js/visually-hidden@0.0.1
  - @zag-js/form-utils@0.2.5
  - @zag-js/dom-event@0.0.1
  - @zag-js/dom-query@0.1.3
  - @zag-js/popper@0.2.4
  - @zag-js/core@0.2.10

## 0.1.11

### Patch Changes

- Updated dependencies [[`df27f257`](https://github.com/chakra-ui/zag/commit/df27f257f53d194013b528342d3d9aef994d0d5c)]:
  - @zag-js/core@0.2.9

## 0.1.10

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.2.8

## 0.1.9

### Patch Changes

- [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch to `es2020` to support `import.meta.env`

- Updated dependencies [[`f7bb988a`](https://github.com/chakra-ui/zag/commit/f7bb988aaeda6c6caebe95823f4cd44baa0d5e78),
  [`6957678d`](https://github.com/chakra-ui/zag/commit/6957678d2f00f4d219e791dffed91446e64211e7),
  [`fef822b9`](https://github.com/chakra-ui/zag/commit/fef822b91a4a9dbfc3c1e8f88a89727a3231326a)]:
  - @zag-js/core@0.2.7
  - @zag-js/anatomy@0.1.4
  - @zag-js/types@0.3.4
  - @zag-js/interact-outside@0.2.2
  - @zag-js/popper@0.2.3

## 0.1.8

### Patch Changes

- Updated dependencies [[`80de0b7c`](https://github.com/chakra-ui/zag/commit/80de0b7c7f888a254a3e1fec2da5338e235bc699)]:
  - @zag-js/core@0.2.6

## 0.1.7

### Patch Changes

- Updated dependencies [[`c1f609df`](https://github.com/chakra-ui/zag/commit/c1f609dfabbc31c296ebdc1e89480313130f832b),
  [`c7e85e20`](https://github.com/chakra-ui/zag/commit/c7e85e20d4d08b56852768becf2fc5f7f4275dcc)]:
  - @zag-js/types@0.3.3
  - @zag-js/core@0.2.5
  - @zag-js/interact-outside@0.2.1
  - @zag-js/popper@0.2.2

## 0.1.6

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
  - @zag-js/interact-outside@0.2.1
  - @zag-js/popper@0.2.2

## 0.1.5

### Patch Changes

- Updated dependencies [[`5bd24f02`](https://github.com/chakra-ui/zag/commit/5bd24f02fcab355f7df8a2d5cea3b155155380f8)]:
  - @zag-js/anatomy@0.1.2

## 0.1.4

### Patch Changes

- [`cdef3fb0`](https://github.com/chakra-ui/zag/commit/cdef3fb08d61557bee50cdba63458406b731690e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix package entrypoints

## 0.1.3

### Patch Changes

- [`af4ab9bb`](https://github.com/chakra-ui/zag/commit/af4ab9bb7cd599c53e47ca7ed2ea90a4ff742499) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update anatomy of components

- [#445](https://github.com/chakra-ui/zag/pull/445)
  [`3e242276`](https://github.com/chakra-ui/zag/commit/3e242276689016542e8a804329971bf493b8ba50) Thanks
  [@visualjerk](https://github.com/visualjerk)! - Fix aria-labelledby on select trigger

- Updated dependencies [[`9d936614`](https://github.com/chakra-ui/zag/commit/9d93661439f10a550c154e9f290905d32e8f509b),
  [`9332f1ca`](https://github.com/chakra-ui/zag/commit/9332f1caf5122c16a3edb48e20664b04714d226c)]:
  - @zag-js/core@0.2.3
  - @zag-js/popper@0.2.1

## 0.1.2

### Patch Changes

- [#416](https://github.com/chakra-ui/zag/pull/416)
  [`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Describe the anatomy of a machine and use it to generate data-scope
  and data-part

- Updated dependencies [[`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b)]:
  - @zag-js/anatomy@0.1.1

## 0.1.1

### Patch Changes

- [`839a296a`](https://github.com/chakra-ui/zag/commit/839a296ac493c4305d6f4cf0bf12c0762463e91a) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Rename `openMenu`/`closeMenu` to `open`/`close` respectively for
  consistency

  - Add `type=button` to select trigger
  - Add missing `data-disabled` attribute to select trigger
  - Set `selectOnTab` to `false` by default

- [`985d9b26`](https://github.com/chakra-ui/zag/commit/985d9b26a9db7e585ff504bbaa88de6835cf3fd0) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure consistent API naming for `readonly` by renaming it to
  `readOnly`

## 0.1.0

### Minor Changes

- [#378](https://github.com/chakra-ui/zag/pull/378)
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`44feef0b`](https://github.com/chakra-ui/zag/commit/44feef0bdf312e27d6faf1aa8ab0ecff0281108c),
  [`810e7d85`](https://github.com/chakra-ui/zag/commit/810e7d85274a26e0fe76dbdb2829fd7ab7f982a6),
  [`e328b306`](https://github.com/chakra-ui/zag/commit/e328b306bf06d151fff4907a7e8e1160f07af855),
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999)]:
  - @zag-js/core@0.2.2
  - @zag-js/types@0.3.1
  - @zag-js/interact-outside@0.2.0
  - @zag-js/popper@0.2.0
