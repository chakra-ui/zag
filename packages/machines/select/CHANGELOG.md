# @zag-js/select

## 1.26.3

### Patch Changes

- [#2787](https://github.com/chakra-ui/zag/pull/2787)
  [`a52c5a1`](https://github.com/chakra-ui/zag/commit/a52c5a132794958c1c62fe459c5942b30b131191) Thanks
  [@Hagendorn](https://github.com/Hagendorn)! - Fix accessibility violation where the required state was not set
  correctly to on the trigger.

- Updated dependencies []:
  - @zag-js/anatomy@1.26.3
  - @zag-js/core@1.26.3
  - @zag-js/types@1.26.3
  - @zag-js/collection@1.26.3
  - @zag-js/utils@1.26.3
  - @zag-js/dismissable@1.26.3
  - @zag-js/dom-query@1.26.3
  - @zag-js/popper@1.26.3

## 1.26.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.2
  - @zag-js/core@1.26.2
  - @zag-js/types@1.26.2
  - @zag-js/collection@1.26.2
  - @zag-js/utils@1.26.2
  - @zag-js/dismissable@1.26.2
  - @zag-js/dom-query@1.26.2
  - @zag-js/popper@1.26.2

## 1.26.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.1
  - @zag-js/core@1.26.1
  - @zag-js/types@1.26.1
  - @zag-js/collection@1.26.1
  - @zag-js/utils@1.26.1
  - @zag-js/dismissable@1.26.1
  - @zag-js/dom-query@1.26.1
  - @zag-js/popper@1.26.1

## 1.26.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.0
  - @zag-js/core@1.26.0
  - @zag-js/types@1.26.0
  - @zag-js/collection@1.26.0
  - @zag-js/utils@1.26.0
  - @zag-js/dismissable@1.26.0
  - @zag-js/dom-query@1.26.0
  - @zag-js/popper@1.26.0

## 1.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.25.0
  - @zag-js/core@1.25.0
  - @zag-js/types@1.25.0
  - @zag-js/collection@1.25.0
  - @zag-js/utils@1.25.0
  - @zag-js/dismissable@1.25.0
  - @zag-js/dom-query@1.25.0
  - @zag-js/popper@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.2
  - @zag-js/core@1.24.2
  - @zag-js/types@1.24.2
  - @zag-js/collection@1.24.2
  - @zag-js/utils@1.24.2
  - @zag-js/dismissable@1.24.2
  - @zag-js/dom-query@1.24.2
  - @zag-js/popper@1.24.2

## 1.24.1

### Patch Changes

- Updated dependencies [[`ab0d4f7`](https://github.com/chakra-ui/zag/commit/ab0d4f73d6ca0571cb09ebad5bf724fe81e94ef8)]:
  - @zag-js/core@1.24.1
  - @zag-js/anatomy@1.24.1
  - @zag-js/types@1.24.1
  - @zag-js/collection@1.24.1
  - @zag-js/utils@1.24.1
  - @zag-js/dismissable@1.24.1
  - @zag-js/dom-query@1.24.1
  - @zag-js/popper@1.24.1

## 1.24.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.0
  - @zag-js/core@1.24.0
  - @zag-js/types@1.24.0
  - @zag-js/collection@1.24.0
  - @zag-js/utils@1.24.0
  - @zag-js/dismissable@1.24.0
  - @zag-js/dom-query@1.24.0
  - @zag-js/popper@1.24.0

## 1.23.0

### Minor Changes

- [`352c638`](https://github.com/chakra-ui/zag/commit/352c638b9d2bc9f603f3323a4bb18a87ae3fd9ab) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for layer types in dismissable layer stack. Layers can
  now be categorized as `dialog`, `popover`, `menu`, or `listbox`. This enables:
  - `data-nested` attribute on nested layers of the same type
  - `data-has-nested` attribute on parent layers with nested children of the same type
  - `--nested-layer-count` CSS variable indicating the number of nested layers of the same type

### Patch Changes

- [#2673](https://github.com/chakra-ui/zag/pull/2673)
  [`a493193`](https://github.com/chakra-ui/zag/commit/a493193dd55524e14800bfc449ca137be7f633aa) Thanks
  [@julienbenac](https://github.com/julienbenac)! - Add `data-required` to label parts

- Updated dependencies [[`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`352c638`](https://github.com/chakra-ui/zag/commit/352c638b9d2bc9f603f3323a4bb18a87ae3fd9ab),
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac),
  [`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/dom-query@1.23.0
  - @zag-js/dismissable@1.23.0
  - @zag-js/core@1.23.0
  - @zag-js/popper@1.23.0
  - @zag-js/anatomy@1.23.0
  - @zag-js/types@1.23.0
  - @zag-js/collection@1.23.0
  - @zag-js/utils@1.23.0

## 1.22.1

### Patch Changes

- Updated dependencies [[`4790d22`](https://github.com/chakra-ui/zag/commit/4790d22ee49c02daafad02aa4f5beb5fcdd507f7)]:
  - @zag-js/collection@1.22.1
  - @zag-js/anatomy@1.22.1
  - @zag-js/core@1.22.1
  - @zag-js/types@1.22.1
  - @zag-js/utils@1.22.1
  - @zag-js/dismissable@1.22.1
  - @zag-js/dom-query@1.22.1
  - @zag-js/popper@1.22.1

## 1.22.0

### Patch Changes

- Updated dependencies [[`c1f9b45`](https://github.com/chakra-ui/zag/commit/c1f9b45cf71308b1376fc70d0c5b785fd0a8e275)]:
  - @zag-js/dismissable@1.22.0
  - @zag-js/anatomy@1.22.0
  - @zag-js/core@1.22.0
  - @zag-js/types@1.22.0
  - @zag-js/collection@1.22.0
  - @zag-js/utils@1.22.0
  - @zag-js/dom-query@1.22.0
  - @zag-js/popper@1.22.0

## 1.21.9

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.9
  - @zag-js/core@1.21.9
  - @zag-js/types@1.21.9
  - @zag-js/collection@1.21.9
  - @zag-js/utils@1.21.9
  - @zag-js/dismissable@1.21.9
  - @zag-js/dom-query@1.21.9
  - @zag-js/popper@1.21.9

## 1.21.8

### Patch Changes

- [`d4d276e`](https://github.com/chakra-ui/zag/commit/d4d276eb2a4f8fd662abd8d1791a05c4307810e8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - **Listbox, Select, Combobox:** Add required `getElement` to
  `scrollToIndexFn` details and pass the element getter when scrolling to the highlighted index and on initial
  scroll-to-top.
  - **Listbox:** Track collection changes and clear `highlightedValue` if the item is no longer in the collection.

- Updated dependencies [[`dd1519a`](https://github.com/chakra-ui/zag/commit/dd1519a668f315e2feab7aed51007f3380880229)]:
  - @zag-js/dom-query@1.21.8
  - @zag-js/core@1.21.8
  - @zag-js/dismissable@1.21.8
  - @zag-js/popper@1.21.8
  - @zag-js/anatomy@1.21.8
  - @zag-js/types@1.21.8
  - @zag-js/collection@1.21.8
  - @zag-js/utils@1.21.8

## 1.21.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.7
  - @zag-js/core@1.21.7
  - @zag-js/types@1.21.7
  - @zag-js/collection@1.21.7
  - @zag-js/utils@1.21.7
  - @zag-js/dismissable@1.21.7
  - @zag-js/dom-query@1.21.7
  - @zag-js/popper@1.21.7

## 1.21.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.6
  - @zag-js/core@1.21.6
  - @zag-js/types@1.21.6
  - @zag-js/collection@1.21.6
  - @zag-js/utils@1.21.6
  - @zag-js/dismissable@1.21.6
  - @zag-js/dom-query@1.21.6
  - @zag-js/popper@1.21.6

## 1.21.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.5
  - @zag-js/core@1.21.5
  - @zag-js/types@1.21.5
  - @zag-js/collection@1.21.5
  - @zag-js/utils@1.21.5
  - @zag-js/dismissable@1.21.5
  - @zag-js/dom-query@1.21.5
  - @zag-js/popper@1.21.5

## 1.21.4

### Patch Changes

- Updated dependencies [[`d07647c`](https://github.com/chakra-ui/zag/commit/d07647cc53cec91d126653dec056c7dd7f9805a7)]:
  - @zag-js/collection@1.21.4
  - @zag-js/anatomy@1.21.4
  - @zag-js/core@1.21.4
  - @zag-js/types@1.21.4
  - @zag-js/utils@1.21.4
  - @zag-js/dismissable@1.21.4
  - @zag-js/dom-query@1.21.4
  - @zag-js/popper@1.21.4

## 1.21.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.3
  - @zag-js/core@1.21.3
  - @zag-js/types@1.21.3
  - @zag-js/collection@1.21.3
  - @zag-js/utils@1.21.3
  - @zag-js/dismissable@1.21.3
  - @zag-js/dom-query@1.21.3
  - @zag-js/popper@1.21.3

## 1.21.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.2
  - @zag-js/core@1.21.2
  - @zag-js/types@1.21.2
  - @zag-js/collection@1.21.2
  - @zag-js/utils@1.21.2
  - @zag-js/dismissable@1.21.2
  - @zag-js/dom-query@1.21.2
  - @zag-js/popper@1.21.2

## 1.21.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.1
  - @zag-js/core@1.21.1
  - @zag-js/types@1.21.1
  - @zag-js/collection@1.21.1
  - @zag-js/utils@1.21.1
  - @zag-js/dismissable@1.21.1
  - @zag-js/dom-query@1.21.1
  - @zag-js/popper@1.21.1

## 1.21.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.0
  - @zag-js/core@1.21.0
  - @zag-js/types@1.21.0
  - @zag-js/collection@1.21.0
  - @zag-js/utils@1.21.0
  - @zag-js/dismissable@1.21.0
  - @zag-js/dom-query@1.21.0
  - @zag-js/popper@1.21.0

## 1.20.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.1
  - @zag-js/core@1.20.1
  - @zag-js/types@1.20.1
  - @zag-js/collection@1.20.1
  - @zag-js/utils@1.20.1
  - @zag-js/dismissable@1.20.1
  - @zag-js/dom-query@1.20.1
  - @zag-js/popper@1.20.1

## 1.20.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.0
  - @zag-js/core@1.20.0
  - @zag-js/types@1.20.0
  - @zag-js/collection@1.20.0
  - @zag-js/utils@1.20.0
  - @zag-js/dismissable@1.20.0
  - @zag-js/dom-query@1.20.0
  - @zag-js/popper@1.20.0

## 1.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.19.0
  - @zag-js/core@1.19.0
  - @zag-js/types@1.19.0
  - @zag-js/collection@1.19.0
  - @zag-js/utils@1.19.0
  - @zag-js/dismissable@1.19.0
  - @zag-js/dom-query@1.19.0
  - @zag-js/popper@1.19.0

## 1.18.5

### Patch Changes

- [`59a7bfb`](https://github.com/chakra-ui/zag/commit/59a7bfb7215b4c9d13d11487f50ad852cd8347a9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue destructuring returned api could throw an ESLint
  `unbound-method` warning

- Updated dependencies [[`218ab81`](https://github.com/chakra-ui/zag/commit/218ab81e6453356a3bbd5e5eb612d9b671f84323)]:
  - @zag-js/popper@1.18.5
  - @zag-js/anatomy@1.18.5
  - @zag-js/core@1.18.5
  - @zag-js/types@1.18.5
  - @zag-js/collection@1.18.5
  - @zag-js/utils@1.18.5
  - @zag-js/dismissable@1.18.5
  - @zag-js/dom-query@1.18.5

## 1.18.4

### Patch Changes

- Updated dependencies [[`8d0179b`](https://github.com/chakra-ui/zag/commit/8d0179b282dc6bedbd7d782192c82df872bf5697)]:
  - @zag-js/collection@1.18.4
  - @zag-js/anatomy@1.18.4
  - @zag-js/core@1.18.4
  - @zag-js/types@1.18.4
  - @zag-js/utils@1.18.4
  - @zag-js/dismissable@1.18.4
  - @zag-js/dom-query@1.18.4
  - @zag-js/popper@1.18.4

## 1.18.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.3
  - @zag-js/core@1.18.3
  - @zag-js/types@1.18.3
  - @zag-js/collection@1.18.3
  - @zag-js/utils@1.18.3
  - @zag-js/dismissable@1.18.3
  - @zag-js/dom-query@1.18.3
  - @zag-js/popper@1.18.3

## 1.18.2

### Patch Changes

- Updated dependencies [[`3b583f8`](https://github.com/chakra-ui/zag/commit/3b583f8e71dcf625d09d895f90e26e454b725cc5),
  [`11843e6`](https://github.com/chakra-ui/zag/commit/11843e6adf62b906006890c8003b38da2850c8ee)]:
  - @zag-js/collection@1.18.2
  - @zag-js/utils@1.18.2
  - @zag-js/core@1.18.2
  - @zag-js/dismissable@1.18.2
  - @zag-js/popper@1.18.2
  - @zag-js/anatomy@1.18.2
  - @zag-js/types@1.18.2
  - @zag-js/dom-query@1.18.2

## 1.18.1

### Patch Changes

- [`9296233`](https://github.com/chakra-ui/zag/commit/9296233b201f4e634843e5c327d75fdd0bf63d3b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose function to clear highlighted value

- [`7ffe018`](https://github.com/chakra-ui/zag/commit/7ffe018bd12a02c032a72a4d65e5ecbf66a80ba1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Select highlighted item only if it exists in the collection

- Updated dependencies []:
  - @zag-js/anatomy@1.18.1
  - @zag-js/core@1.18.1
  - @zag-js/types@1.18.1
  - @zag-js/collection@1.18.1
  - @zag-js/utils@1.18.1
  - @zag-js/dismissable@1.18.1
  - @zag-js/dom-query@1.18.1
  - @zag-js/popper@1.18.1

## 1.18.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.0
  - @zag-js/core@1.18.0
  - @zag-js/types@1.18.0
  - @zag-js/collection@1.18.0
  - @zag-js/utils@1.18.0
  - @zag-js/dismissable@1.18.0
  - @zag-js/dom-query@1.18.0
  - @zag-js/popper@1.18.0

## 1.17.4

### Patch Changes

- [`b709e44`](https://github.com/chakra-ui/zag/commit/b709e44ae7442f40ff2ad671b6a08604f26c6fae) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where rehydrating `defaultValue` or `value` after
  fetching items doesn't update the `valueAsString`

- Updated dependencies []:
  - @zag-js/anatomy@1.17.4
  - @zag-js/core@1.17.4
  - @zag-js/types@1.17.4
  - @zag-js/collection@1.17.4
  - @zag-js/utils@1.17.4
  - @zag-js/dismissable@1.17.4
  - @zag-js/dom-query@1.17.4
  - @zag-js/popper@1.17.4

## 1.17.3

### Patch Changes

- Updated dependencies [[`bc70411`](https://github.com/chakra-ui/zag/commit/bc7041187e5b8dc950c7e6b57aadc1e50b8a3850)]:
  - @zag-js/collection@1.17.3
  - @zag-js/anatomy@1.17.3
  - @zag-js/core@1.17.3
  - @zag-js/types@1.17.3
  - @zag-js/utils@1.17.3
  - @zag-js/dismissable@1.17.3
  - @zag-js/dom-query@1.17.3
  - @zag-js/popper@1.17.3

## 1.17.2

### Patch Changes

- Updated dependencies [[`2ce6e5c`](https://github.com/chakra-ui/zag/commit/2ce6e5c2296d07c16220eb85fbd720a5b33e1f48)]:
  - @zag-js/collection@1.17.2
  - @zag-js/anatomy@1.17.2
  - @zag-js/core@1.17.2
  - @zag-js/types@1.17.2
  - @zag-js/utils@1.17.2
  - @zag-js/dismissable@1.17.2
  - @zag-js/dom-query@1.17.2
  - @zag-js/popper@1.17.2

## 1.17.1

### Patch Changes

- Updated dependencies [[`4b6302f`](https://github.com/chakra-ui/zag/commit/4b6302fc9104f1ae8cd89a0f0157884fb775a65a)]:
  - @zag-js/anatomy@1.17.1
  - @zag-js/core@1.17.1
  - @zag-js/types@1.17.1
  - @zag-js/collection@1.17.1
  - @zag-js/utils@1.17.1
  - @zag-js/dismissable@1.17.1
  - @zag-js/dom-query@1.17.1
  - @zag-js/popper@1.17.1

## 1.17.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.0
  - @zag-js/core@1.17.0
  - @zag-js/types@1.17.0
  - @zag-js/collection@1.17.0
  - @zag-js/utils@1.17.0
  - @zag-js/dismissable@1.17.0
  - @zag-js/dom-query@1.17.0
  - @zag-js/popper@1.17.0

## 1.16.0

### Patch Changes

- Updated dependencies [[`f0545c6`](https://github.com/chakra-ui/zag/commit/f0545c61ef151e5e4480b0cc1d7401dda4653094),
  [`6f6c8f3`](https://github.com/chakra-ui/zag/commit/6f6c8f329d9eb9d9889eff4317c84a4f41d4bfb2)]:
  - @zag-js/collection@1.16.0
  - @zag-js/types@1.16.0
  - @zag-js/dom-query@1.16.0
  - @zag-js/core@1.16.0
  - @zag-js/dismissable@1.16.0
  - @zag-js/popper@1.16.0
  - @zag-js/anatomy@1.16.0
  - @zag-js/utils@1.16.0

## 1.15.7

### Patch Changes

- Updated dependencies [[`3de5dd0`](https://github.com/chakra-ui/zag/commit/3de5dd059f847bd68cafaae230e706783ff43dc6)]:
  - @zag-js/collection@1.15.7
  - @zag-js/anatomy@1.15.7
  - @zag-js/core@1.15.7
  - @zag-js/types@1.15.7
  - @zag-js/utils@1.15.7
  - @zag-js/dismissable@1.15.7
  - @zag-js/dom-query@1.15.7
  - @zag-js/popper@1.15.7

## 1.15.6

### Patch Changes

- Updated dependencies [[`bb9b1e1`](https://github.com/chakra-ui/zag/commit/bb9b1e128ee9ff6318bbbbb2505c192435f05d1e)]:
  - @zag-js/collection@1.15.6
  - @zag-js/anatomy@1.15.6
  - @zag-js/core@1.15.6
  - @zag-js/types@1.15.6
  - @zag-js/utils@1.15.6
  - @zag-js/dismissable@1.15.6
  - @zag-js/dom-query@1.15.6
  - @zag-js/popper@1.15.6

## 1.15.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.5
  - @zag-js/core@1.15.5
  - @zag-js/types@1.15.5
  - @zag-js/collection@1.15.5
  - @zag-js/utils@1.15.5
  - @zag-js/dismissable@1.15.5
  - @zag-js/dom-query@1.15.5
  - @zag-js/popper@1.15.5

## 1.15.4

### Patch Changes

- Updated dependencies [[`e5f698d`](https://github.com/chakra-ui/zag/commit/e5f698d082ea8ae7f9f45958c4e319de7c7b6107)]:
  - @zag-js/dom-query@1.15.4
  - @zag-js/core@1.15.4
  - @zag-js/dismissable@1.15.4
  - @zag-js/popper@1.15.4
  - @zag-js/anatomy@1.15.4
  - @zag-js/types@1.15.4
  - @zag-js/collection@1.15.4
  - @zag-js/utils@1.15.4

## 1.15.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.3
  - @zag-js/core@1.15.3
  - @zag-js/types@1.15.3
  - @zag-js/collection@1.15.3
  - @zag-js/utils@1.15.3
  - @zag-js/dismissable@1.15.3
  - @zag-js/dom-query@1.15.3
  - @zag-js/popper@1.15.3

## 1.15.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.2
  - @zag-js/core@1.15.2
  - @zag-js/types@1.15.2
  - @zag-js/collection@1.15.2
  - @zag-js/utils@1.15.2
  - @zag-js/dismissable@1.15.2
  - @zag-js/dom-query@1.15.2
  - @zag-js/popper@1.15.2

## 1.15.1

### Patch Changes

- [`aaf33ad`](https://github.com/chakra-ui/zag/commit/aaf33ad95098e40c1b8d1f715a40b0eb213641f9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where highlighted item could be cleared when navigating
  up/down the list with keyboard.

- Updated dependencies [[`af01eeb`](https://github.com/chakra-ui/zag/commit/af01eebf013dd9c16821474a26d846f502530feb)]:
  - @zag-js/collection@1.15.1
  - @zag-js/anatomy@1.15.1
  - @zag-js/core@1.15.1
  - @zag-js/types@1.15.1
  - @zag-js/utils@1.15.1
  - @zag-js/dismissable@1.15.1
  - @zag-js/dom-query@1.15.1
  - @zag-js/popper@1.15.1

## 1.15.0

### Patch Changes

- Updated dependencies [[`ce98b54`](https://github.com/chakra-ui/zag/commit/ce98b54a9cf6c241bc15ce5bbb017797438ecdc6)]:
  - @zag-js/collection@1.15.0
  - @zag-js/anatomy@1.15.0
  - @zag-js/core@1.15.0
  - @zag-js/types@1.15.0
  - @zag-js/utils@1.15.0
  - @zag-js/dismissable@1.15.0
  - @zag-js/dom-query@1.15.0
  - @zag-js/popper@1.15.0

## 1.14.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.14.0
  - @zag-js/core@1.14.0
  - @zag-js/types@1.14.0
  - @zag-js/collection@1.14.0
  - @zag-js/utils@1.14.0
  - @zag-js/dismissable@1.14.0
  - @zag-js/dom-query@1.14.0
  - @zag-js/popper@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.1
  - @zag-js/core@1.13.1
  - @zag-js/types@1.13.1
  - @zag-js/collection@1.13.1
  - @zag-js/utils@1.13.1
  - @zag-js/dismissable@1.13.1
  - @zag-js/dom-query@1.13.1
  - @zag-js/popper@1.13.1

## 1.13.0

### Minor Changes

- [`7366236`](https://github.com/chakra-ui/zag/commit/7366236f35058c8b2ffe52a6939a770158bda62f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `onSelect` callback that gets fired when an item is selected
  via keyboard/mouse

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.0
  - @zag-js/core@1.13.0
  - @zag-js/types@1.13.0
  - @zag-js/collection@1.13.0
  - @zag-js/utils@1.13.0
  - @zag-js/dismissable@1.13.0
  - @zag-js/dom-query@1.13.0
  - @zag-js/popper@1.13.0

## 1.12.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.4
  - @zag-js/core@1.12.4
  - @zag-js/types@1.12.4
  - @zag-js/collection@1.12.4
  - @zag-js/utils@1.12.4
  - @zag-js/dismissable@1.12.4
  - @zag-js/dom-query@1.12.4
  - @zag-js/popper@1.12.4

## 1.12.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.3
  - @zag-js/core@1.12.3
  - @zag-js/types@1.12.3
  - @zag-js/collection@1.12.3
  - @zag-js/utils@1.12.3
  - @zag-js/dismissable@1.12.3
  - @zag-js/dom-query@1.12.3
  - @zag-js/popper@1.12.3

## 1.12.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.2
  - @zag-js/core@1.12.2
  - @zag-js/types@1.12.2
  - @zag-js/collection@1.12.2
  - @zag-js/utils@1.12.2
  - @zag-js/dismissable@1.12.2
  - @zag-js/dom-query@1.12.2
  - @zag-js/popper@1.12.2

## 1.12.1

### Patch Changes

- Updated dependencies [[`eb31845`](https://github.com/chakra-ui/zag/commit/eb318457bea7f7a2dc3a219f463dcd74f8acd49e)]:
  - @zag-js/collection@1.12.1
  - @zag-js/anatomy@1.12.1
  - @zag-js/core@1.12.1
  - @zag-js/types@1.12.1
  - @zag-js/utils@1.12.1
  - @zag-js/dismissable@1.12.1
  - @zag-js/dom-query@1.12.1
  - @zag-js/popper@1.12.1

## 1.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.0
  - @zag-js/core@1.12.0
  - @zag-js/types@1.12.0
  - @zag-js/collection@1.12.0
  - @zag-js/utils@1.12.0
  - @zag-js/dismissable@1.12.0
  - @zag-js/dom-query@1.12.0
  - @zag-js/popper@1.12.0

## 1.11.0

### Patch Changes

- Updated dependencies [[`a2ee03f`](https://github.com/chakra-ui/zag/commit/a2ee03f8a6fd7bd7baf4143ecda2efe5cff5a860)]:
  - @zag-js/collection@1.11.0
  - @zag-js/anatomy@1.11.0
  - @zag-js/core@1.11.0
  - @zag-js/types@1.11.0
  - @zag-js/utils@1.11.0
  - @zag-js/dismissable@1.11.0
  - @zag-js/dom-query@1.11.0
  - @zag-js/popper@1.11.0

## 1.10.0

### Patch Changes

- [`d6c55d8`](https://github.com/chakra-ui/zag/commit/d6c55d8362214986adec8832744804541810fcfc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where machine doesn't leave focus state with
  interacting outside with another editable element. This leads to the `data-focus` attribute not being removed from the
  trigger element.
- Updated dependencies []:
  - @zag-js/anatomy@1.10.0
  - @zag-js/core@1.10.0
  - @zag-js/types@1.10.0
  - @zag-js/collection@1.10.0
  - @zag-js/utils@1.10.0
  - @zag-js/dismissable@1.10.0
  - @zag-js/dom-query@1.10.0
  - @zag-js/popper@1.10.0

## 1.9.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.3
  - @zag-js/core@1.9.3
  - @zag-js/types@1.9.3
  - @zag-js/collection@1.9.3
  - @zag-js/utils@1.9.3
  - @zag-js/dismissable@1.9.3
  - @zag-js/dom-query@1.9.3
  - @zag-js/popper@1.9.3

## 1.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.2
  - @zag-js/core@1.9.2
  - @zag-js/types@1.9.2
  - @zag-js/collection@1.9.2
  - @zag-js/utils@1.9.2
  - @zag-js/dismissable@1.9.2
  - @zag-js/dom-query@1.9.2
  - @zag-js/popper@1.9.2

## 1.9.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.1
  - @zag-js/core@1.9.1
  - @zag-js/types@1.9.1
  - @zag-js/collection@1.9.1
  - @zag-js/utils@1.9.1
  - @zag-js/dismissable@1.9.1
  - @zag-js/dom-query@1.9.1
  - @zag-js/popper@1.9.1

## 1.9.0

### Patch Changes

- Updated dependencies [[`490dd9f`](https://github.com/chakra-ui/zag/commit/490dd9fa6355eb25c6bbb77406cae24835453af5)]:
  - @zag-js/collection@1.9.0
  - @zag-js/anatomy@1.9.0
  - @zag-js/core@1.9.0
  - @zag-js/types@1.9.0
  - @zag-js/utils@1.9.0
  - @zag-js/dismissable@1.9.0
  - @zag-js/dom-query@1.9.0
  - @zag-js/popper@1.9.0

## 1.8.2

### Patch Changes

- Updated dependencies [[`25d93b8`](https://github.com/chakra-ui/zag/commit/25d93b8be12e8df26ed04c5d298c66f54910fe85)]:
  - @zag-js/dom-query@1.8.2
  - @zag-js/core@1.8.2
  - @zag-js/dismissable@1.8.2
  - @zag-js/popper@1.8.2
  - @zag-js/anatomy@1.8.2
  - @zag-js/types@1.8.2
  - @zag-js/collection@1.8.2
  - @zag-js/utils@1.8.2

## 1.8.1

### Patch Changes

- Updated dependencies [[`c3c1642`](https://github.com/chakra-ui/zag/commit/c3c164296cd643f2fb7c12c0d1fe9c406eba352f)]:
  - @zag-js/dom-query@1.8.1
  - @zag-js/core@1.8.1
  - @zag-js/dismissable@1.8.1
  - @zag-js/popper@1.8.1
  - @zag-js/anatomy@1.8.1
  - @zag-js/types@1.8.1
  - @zag-js/collection@1.8.1
  - @zag-js/utils@1.8.1

## 1.8.0

### Patch Changes

- Updated dependencies [[`0cb6c0e`](https://github.com/chakra-ui/zag/commit/0cb6c0e70193b8a30c17c96f2b739be215f266ed),
  [`66f7828`](https://github.com/chakra-ui/zag/commit/66f7828541102fcf4f0fba05bb241e20a5ed45cb)]:
  - @zag-js/collection@1.8.0
  - @zag-js/core@1.8.0
  - @zag-js/dismissable@1.8.0
  - @zag-js/anatomy@1.8.0
  - @zag-js/types@1.8.0
  - @zag-js/utils@1.8.0
  - @zag-js/dom-query@1.8.0
  - @zag-js/popper@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.7.0
  - @zag-js/core@1.7.0
  - @zag-js/types@1.7.0
  - @zag-js/collection@1.7.0
  - @zag-js/utils@1.7.0
  - @zag-js/dismissable@1.7.0
  - @zag-js/dom-query@1.7.0
  - @zag-js/popper@1.7.0

## 1.6.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.2
  - @zag-js/core@1.6.2
  - @zag-js/types@1.6.2
  - @zag-js/collection@1.6.2
  - @zag-js/utils@1.6.2
  - @zag-js/dismissable@1.6.2
  - @zag-js/dom-query@1.6.2
  - @zag-js/popper@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.1
  - @zag-js/core@1.6.1
  - @zag-js/types@1.6.1
  - @zag-js/collection@1.6.1
  - @zag-js/utils@1.6.1
  - @zag-js/dismissable@1.6.1
  - @zag-js/dom-query@1.6.1
  - @zag-js/popper@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.0
  - @zag-js/core@1.6.0
  - @zag-js/types@1.6.0
  - @zag-js/collection@1.6.0
  - @zag-js/utils@1.6.0
  - @zag-js/dismissable@1.6.0
  - @zag-js/dom-query@1.6.0
  - @zag-js/popper@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.5.0
  - @zag-js/core@1.5.0
  - @zag-js/types@1.5.0
  - @zag-js/collection@1.5.0
  - @zag-js/utils@1.5.0
  - @zag-js/dismissable@1.5.0
  - @zag-js/dom-query@1.5.0
  - @zag-js/popper@1.5.0

## 1.4.2

### Patch Changes

- [`469d927`](https://github.com/chakra-ui/zag/commit/469d927388e32ebafb8db22f6ad199b15b65b0bb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where select `valueAsString` loses reactivity

- Updated dependencies [[`469d927`](https://github.com/chakra-ui/zag/commit/469d927388e32ebafb8db22f6ad199b15b65b0bb)]:
  - @zag-js/collection@1.4.2
  - @zag-js/anatomy@1.4.2
  - @zag-js/core@1.4.2
  - @zag-js/types@1.4.2
  - @zag-js/utils@1.4.2
  - @zag-js/dismissable@1.4.2
  - @zag-js/dom-query@1.4.2
  - @zag-js/popper@1.4.2

## 1.4.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.1
  - @zag-js/core@1.4.1
  - @zag-js/types@1.4.1
  - @zag-js/collection@1.4.1
  - @zag-js/utils@1.4.1
  - @zag-js/dismissable@1.4.1
  - @zag-js/dom-query@1.4.1
  - @zag-js/popper@1.4.1

## 1.4.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.0
  - @zag-js/core@1.4.0
  - @zag-js/types@1.4.0
  - @zag-js/collection@1.4.0
  - @zag-js/utils@1.4.0
  - @zag-js/dismissable@1.4.0
  - @zag-js/dom-query@1.4.0
  - @zag-js/popper@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`66ba41b`](https://github.com/chakra-ui/zag/commit/66ba41bb10b232ff08e3cfbfc6cbf2a1c7449e21)]:
  - @zag-js/utils@1.3.3
  - @zag-js/core@1.3.3
  - @zag-js/collection@1.3.3
  - @zag-js/dismissable@1.3.3
  - @zag-js/popper@1.3.3
  - @zag-js/anatomy@1.3.3
  - @zag-js/types@1.3.3
  - @zag-js/dom-query@1.3.3

## 1.3.2

### Patch Changes

- [`db63d0b`](https://github.com/chakra-ui/zag/commit/db63d0b6e8eb030f60b2578e88cfcd226bfa2ccc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Prevent stale closure in `api.setOpen(...)` methods

- Updated dependencies []:
  - @zag-js/anatomy@1.3.2
  - @zag-js/core@1.3.2
  - @zag-js/types@1.3.2
  - @zag-js/collection@1.3.2
  - @zag-js/utils@1.3.2
  - @zag-js/dismissable@1.3.2
  - @zag-js/dom-query@1.3.2
  - @zag-js/popper@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.1
  - @zag-js/core@1.3.1
  - @zag-js/types@1.3.1
  - @zag-js/collection@1.3.1
  - @zag-js/utils@1.3.1
  - @zag-js/dismissable@1.3.1
  - @zag-js/dom-query@1.3.1
  - @zag-js/popper@1.3.1

## 1.3.0

### Patch Changes

- [`01566a1`](https://github.com/chakra-ui/zag/commit/01566a171ef426410b29b881fe1014bd26c2f86f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where machines that hold complex objects

- Updated dependencies []:
  - @zag-js/anatomy@1.3.0
  - @zag-js/core@1.3.0
  - @zag-js/types@1.3.0
  - @zag-js/collection@1.3.0
  - @zag-js/utils@1.3.0
  - @zag-js/dismissable@1.3.0
  - @zag-js/dom-query@1.3.0
  - @zag-js/popper@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.1
  - @zag-js/core@1.2.1
  - @zag-js/types@1.2.1
  - @zag-js/collection@1.2.1
  - @zag-js/utils@1.2.1
  - @zag-js/dismissable@1.2.1
  - @zag-js/dom-query@1.2.1
  - @zag-js/popper@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.0
  - @zag-js/core@1.2.0
  - @zag-js/types@1.2.0
  - @zag-js/collection@1.2.0
  - @zag-js/utils@1.2.0
  - @zag-js/dismissable@1.2.0
  - @zag-js/dom-query@1.2.0
  - @zag-js/popper@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.1.0
  - @zag-js/core@1.1.0
  - @zag-js/types@1.1.0
  - @zag-js/collection@1.1.0
  - @zag-js/utils@1.1.0
  - @zag-js/dismissable@1.1.0
  - @zag-js/dom-query@1.1.0
  - @zag-js/popper@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`2fdf79c`](https://github.com/chakra-ui/zag/commit/2fdf79c82a5cbfa876adc858886ce22b8b52d8fb)]:
  - @zag-js/collection@1.0.2
  - @zag-js/anatomy@1.0.2
  - @zag-js/core@1.0.2
  - @zag-js/types@1.0.2
  - @zag-js/utils@1.0.2
  - @zag-js/dismissable@1.0.2
  - @zag-js/dom-query@1.0.2
  - @zag-js/popper@1.0.2

## 1.0.1

### Patch Changes

- [`0eeec8c`](https://github.com/chakra-ui/zag/commit/0eeec8cee82a5eaae790b6aacac2ec727a960650) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix regression where `multiple: true` doesn't work

- [`9883753`](https://github.com/chakra-ui/zag/commit/98837532c3b9c3f3698eee4e158e4318194361f6) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `<component>.Machine` type to help when typecasting generic
  components like combobox and select.

  Here's an example of the combobox component:

  ```ts
  interface Item {
    code: string
    label: string
  }

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
  })
  ```

- Updated dependencies []:
  - @zag-js/anatomy@1.0.1
  - @zag-js/core@1.0.1
  - @zag-js/types@1.0.1
  - @zag-js/collection@1.0.1
  - @zag-js/utils@1.0.1
  - @zag-js/dismissable@1.0.1
  - @zag-js/dom-query@1.0.1
  - @zag-js/popper@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [[`b1caa44`](https://github.com/chakra-ui/zag/commit/b1caa44085e7f1da0ad24fc7b25178081811646c)]:
  - @zag-js/core@1.0.0
  - @zag-js/anatomy@1.0.0
  - @zag-js/types@1.0.0
  - @zag-js/collection@1.0.0
  - @zag-js/utils@1.0.0
  - @zag-js/dismissable@1.0.0
  - @zag-js/dom-query@1.0.0
  - @zag-js/popper@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies [[`7519355`](https://github.com/chakra-ui/zag/commit/7519355cca15c10c90f47c30aaa3e8041b7089e8)]:
  - @zag-js/dismissable@0.82.2
  - @zag-js/anatomy@0.82.2
  - @zag-js/core@0.82.2
  - @zag-js/types@0.82.2
  - @zag-js/collection@0.82.2
  - @zag-js/utils@0.82.2
  - @zag-js/dom-query@0.82.2
  - @zag-js/popper@0.82.2

## 0.82.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.1
  - @zag-js/core@0.82.1
  - @zag-js/types@0.82.1
  - @zag-js/collection@0.82.1
  - @zag-js/utils@0.82.1
  - @zag-js/dismissable@0.82.1
  - @zag-js/dom-query@0.82.1
  - @zag-js/popper@0.82.1

## 0.82.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.0
  - @zag-js/core@0.82.0
  - @zag-js/types@0.82.0
  - @zag-js/collection@0.82.0
  - @zag-js/utils@0.82.0
  - @zag-js/dismissable@0.82.0
  - @zag-js/dom-query@0.82.0
  - @zag-js/popper@0.82.0

## 0.81.2

### Patch Changes

- Updated dependencies [[`e9313a3`](https://github.com/chakra-ui/zag/commit/e9313a3663285a05c9ac9ac92f1c09fcb27ac818)]:
  - @zag-js/dom-query@0.81.2
  - @zag-js/dismissable@0.81.2
  - @zag-js/popper@0.81.2
  - @zag-js/anatomy@0.81.2
  - @zag-js/core@0.81.2
  - @zag-js/types@0.81.2
  - @zag-js/collection@0.81.2
  - @zag-js/utils@0.81.2

## 0.81.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.81.1
  - @zag-js/core@0.81.1
  - @zag-js/types@0.81.1
  - @zag-js/collection@0.81.1
  - @zag-js/utils@0.81.1
  - @zag-js/dismissable@0.81.1
  - @zag-js/dom-query@0.81.1
  - @zag-js/form-utils@0.81.1
  - @zag-js/popper@0.81.1

## 0.81.0

### Patch Changes

- [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor and streamline packages

- Updated dependencies [[`2e4ae72`](https://github.com/chakra-ui/zag/commit/2e4ae729818cd334d9cfe4ddb15c14dc2aabb6bb),
  [`792939f`](https://github.com/chakra-ui/zag/commit/792939f9d9eac5a97cc46f1b0ab286666ba1edd8),
  [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68)]:
  - @zag-js/collection@0.81.0
  - @zag-js/dom-query@0.81.0
  - @zag-js/dismissable@0.81.0
  - @zag-js/types@0.81.0
  - @zag-js/popper@0.81.0
  - @zag-js/anatomy@0.81.0
  - @zag-js/core@0.81.0
  - @zag-js/utils@0.81.0
  - @zag-js/form-utils@0.81.0

## 0.80.0

### Patch Changes

- Updated dependencies [[`d7617d1`](https://github.com/chakra-ui/zag/commit/d7617d1d95f93b3557eb88ba879737894da42d51)]:
  - @zag-js/dom-query@0.80.0
  - @zag-js/dismissable@0.80.0
  - @zag-js/dom-event@0.80.0
  - @zag-js/popper@0.80.0
  - @zag-js/anatomy@0.80.0
  - @zag-js/core@0.80.0
  - @zag-js/types@0.80.0
  - @zag-js/collection@0.80.0
  - @zag-js/utils@0.80.0
  - @zag-js/form-utils@0.80.0

## 0.79.3

### Patch Changes

- Updated dependencies [[`5fa08c5`](https://github.com/chakra-ui/zag/commit/5fa08c5f8894d6b23570fcd9e2c7bc1ca3d50f01)]:
  - @zag-js/popper@0.79.3
  - @zag-js/dismissable@0.79.3
  - @zag-js/anatomy@0.79.3
  - @zag-js/core@0.79.3
  - @zag-js/types@0.79.3
  - @zag-js/collection@0.79.3
  - @zag-js/utils@0.79.3
  - @zag-js/dom-event@0.79.3
  - @zag-js/dom-query@0.79.3
  - @zag-js/form-utils@0.79.3

## 0.79.2

### Patch Changes

- Updated dependencies [[`525e645`](https://github.com/chakra-ui/zag/commit/525e645404f56c10919cc9d36279044dff253a08)]:
  - @zag-js/dom-query@0.79.2
  - @zag-js/dismissable@0.79.2
  - @zag-js/dom-event@0.79.2
  - @zag-js/popper@0.79.2
  - @zag-js/anatomy@0.79.2
  - @zag-js/core@0.79.2
  - @zag-js/types@0.79.2
  - @zag-js/collection@0.79.2
  - @zag-js/utils@0.79.2
  - @zag-js/form-utils@0.79.2

## 0.79.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.1
  - @zag-js/core@0.79.1
  - @zag-js/types@0.79.1
  - @zag-js/collection@0.79.1
  - @zag-js/utils@0.79.1
  - @zag-js/dismissable@0.79.1
  - @zag-js/dom-event@0.79.1
  - @zag-js/dom-query@0.79.1
  - @zag-js/form-utils@0.79.1
  - @zag-js/popper@0.79.1

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.0
  - @zag-js/core@0.79.0
  - @zag-js/types@0.79.0
  - @zag-js/collection@0.79.0
  - @zag-js/utils@0.79.0
  - @zag-js/dismissable@0.79.0
  - @zag-js/dom-event@0.79.0
  - @zag-js/dom-query@0.79.0
  - @zag-js/form-utils@0.79.0
  - @zag-js/popper@0.79.0

## 0.78.3

### Patch Changes

- Updated dependencies [[`5584a83`](https://github.com/chakra-ui/zag/commit/5584a833151ee9f2c2ef9c07b6d699addfbca18e)]:
  - @zag-js/core@0.78.3
  - @zag-js/anatomy@0.78.3
  - @zag-js/types@0.78.3
  - @zag-js/collection@0.78.3
  - @zag-js/utils@0.78.3
  - @zag-js/dismissable@0.78.3
  - @zag-js/dom-event@0.78.3
  - @zag-js/dom-query@0.78.3
  - @zag-js/form-utils@0.78.3
  - @zag-js/popper@0.78.3

## 0.78.2

### Patch Changes

- Updated dependencies [[`ce85272`](https://github.com/chakra-ui/zag/commit/ce85272c3d64dd4c7bae911ec4e4b813234850c2)]:
  - @zag-js/dom-query@0.78.2
  - @zag-js/dismissable@0.78.2
  - @zag-js/dom-event@0.78.2
  - @zag-js/popper@0.78.2
  - @zag-js/anatomy@0.78.2
  - @zag-js/core@0.78.2
  - @zag-js/types@0.78.2
  - @zag-js/collection@0.78.2
  - @zag-js/utils@0.78.2
  - @zag-js/form-utils@0.78.2

## 0.78.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.1
  - @zag-js/core@0.78.1
  - @zag-js/types@0.78.1
  - @zag-js/collection@0.78.1
  - @zag-js/utils@0.78.1
  - @zag-js/dismissable@0.78.1
  - @zag-js/dom-event@0.78.1
  - @zag-js/dom-query@0.78.1
  - @zag-js/form-utils@0.78.1
  - @zag-js/popper@0.78.1

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.0
  - @zag-js/core@0.78.0
  - @zag-js/types@0.78.0
  - @zag-js/collection@0.78.0
  - @zag-js/utils@0.78.0
  - @zag-js/dismissable@0.78.0
  - @zag-js/dom-event@0.78.0
  - @zag-js/dom-query@0.78.0
  - @zag-js/form-utils@0.78.0
  - @zag-js/popper@0.78.0

## 0.77.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.77.1
  - @zag-js/core@0.77.1
  - @zag-js/types@0.77.1
  - @zag-js/collection@0.77.1
  - @zag-js/utils@0.77.1
  - @zag-js/dismissable@0.77.1
  - @zag-js/dom-event@0.77.1
  - @zag-js/dom-query@0.77.1
  - @zag-js/form-utils@0.77.1
  - @zag-js/popper@0.77.1

## 0.77.0

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/collection@0.77.0
  - @zag-js/dom-query@0.77.0
  - @zag-js/utils@0.77.0
  - @zag-js/dismissable@0.77.0
  - @zag-js/dom-event@0.77.0
  - @zag-js/popper@0.77.0
  - @zag-js/core@0.77.0
  - @zag-js/anatomy@0.77.0
  - @zag-js/types@0.77.0
  - @zag-js/form-utils@0.77.0

## 0.76.0

### Patch Changes

- Updated dependencies [[`70297fe`](https://github.com/chakra-ui/zag/commit/70297fe6abbbc164ab2d38079122e23f8382a23a)]:
  - @zag-js/collection@0.76.0
  - @zag-js/anatomy@0.76.0
  - @zag-js/core@0.76.0
  - @zag-js/types@0.76.0
  - @zag-js/utils@0.76.0
  - @zag-js/dismissable@0.76.0
  - @zag-js/dom-event@0.76.0
  - @zag-js/dom-query@0.76.0
  - @zag-js/form-utils@0.76.0
  - @zag-js/popper@0.76.0

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.75.0
  - @zag-js/core@0.75.0
  - @zag-js/types@0.75.0
  - @zag-js/collection@0.75.0
  - @zag-js/utils@0.75.0
  - @zag-js/dismissable@0.75.0
  - @zag-js/dom-event@0.75.0
  - @zag-js/dom-query@0.75.0
  - @zag-js/form-utils@0.75.0
  - @zag-js/popper@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.2
  - @zag-js/core@0.74.2
  - @zag-js/types@0.74.2
  - @zag-js/collection@0.74.2
  - @zag-js/utils@0.74.2
  - @zag-js/dismissable@0.74.2
  - @zag-js/dom-event@0.74.2
  - @zag-js/dom-query@0.74.2
  - @zag-js/form-utils@0.74.2
  - @zag-js/popper@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.1
  - @zag-js/core@0.74.1
  - @zag-js/types@0.74.1
  - @zag-js/collection@0.74.1
  - @zag-js/utils@0.74.1
  - @zag-js/dismissable@0.74.1
  - @zag-js/dom-event@0.74.1
  - @zag-js/dom-query@0.74.1
  - @zag-js/form-utils@0.74.1
  - @zag-js/popper@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.0
  - @zag-js/core@0.74.0
  - @zag-js/types@0.74.0
  - @zag-js/collection@0.74.0
  - @zag-js/utils@0.74.0
  - @zag-js/dismissable@0.74.0
  - @zag-js/dom-event@0.74.0
  - @zag-js/dom-query@0.74.0
  - @zag-js/form-utils@0.74.0
  - @zag-js/popper@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.1
  - @zag-js/core@0.73.1
  - @zag-js/types@0.73.1
  - @zag-js/collection@0.73.1
  - @zag-js/utils@0.73.1
  - @zag-js/dismissable@0.73.1
  - @zag-js/dom-event@0.73.1
  - @zag-js/dom-query@0.73.1
  - @zag-js/form-utils@0.73.1
  - @zag-js/popper@0.73.1

## 0.73.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/dismissable@0.73.0
  - @zag-js/anatomy@0.73.0
  - @zag-js/core@0.73.0
  - @zag-js/types@0.73.0
  - @zag-js/collection@0.73.0
  - @zag-js/utils@0.73.0
  - @zag-js/dom-event@0.73.0
  - @zag-js/dom-query@0.73.0
  - @zag-js/form-utils@0.73.0
  - @zag-js/popper@0.73.0

## 0.72.0

### Minor Changes

- [`831e941`](https://github.com/chakra-ui/zag/commit/831e941241d48f9345c4da0172e72956beed8b25) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `multiple` and `disabled` in api to allow for designing
  custom UIs.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.72.0
  - @zag-js/core@0.72.0
  - @zag-js/types@0.72.0
  - @zag-js/collection@0.72.0
  - @zag-js/utils@0.72.0
  - @zag-js/dismissable@0.72.0
  - @zag-js/dom-event@0.72.0
  - @zag-js/dom-query@0.72.0
  - @zag-js/form-utils@0.72.0
  - @zag-js/popper@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/core@0.71.0
  - @zag-js/anatomy@0.71.0
  - @zag-js/types@0.71.0
  - @zag-js/collection@0.71.0
  - @zag-js/utils@0.71.0
  - @zag-js/dismissable@0.71.0
  - @zag-js/dom-event@0.71.0
  - @zag-js/dom-query@0.71.0
  - @zag-js/form-utils@0.71.0
  - @zag-js/popper@0.71.0

## 0.70.0

### Minor Changes

- [`7a8b3ff`](https://github.com/chakra-ui/zag/commit/7a8b3ff2071eb1e92c4fedfd6e71269a3c56e22b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `deselectable` prop to allow deselecting the
  current value by clicking on the item.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.70.0
  - @zag-js/core@0.70.0
  - @zag-js/types@0.70.0
  - @zag-js/collection@0.70.0
  - @zag-js/utils@0.70.0
  - @zag-js/dismissable@0.70.0
  - @zag-js/dom-event@0.70.0
  - @zag-js/dom-query@0.70.0
  - @zag-js/form-utils@0.70.0
  - @zag-js/popper@0.70.0

## 0.69.0

### Patch Changes

- Updated dependencies [[`bf57d7b`](https://github.com/chakra-ui/zag/commit/bf57d7b3933daf9974eaefc443da6f3c37706bb4)]:
  - @zag-js/dom-event@0.69.0
  - @zag-js/dom-query@0.69.0
  - @zag-js/dismissable@0.69.0
  - @zag-js/popper@0.69.0
  - @zag-js/anatomy@0.69.0
  - @zag-js/core@0.69.0
  - @zag-js/types@0.69.0
  - @zag-js/collection@0.69.0
  - @zag-js/utils@0.69.0
  - @zag-js/form-utils@0.69.0

## 0.68.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.1
  - @zag-js/core@0.68.1
  - @zag-js/types@0.68.1
  - @zag-js/collection@0.68.1
  - @zag-js/utils@0.68.1
  - @zag-js/dismissable@0.68.1
  - @zag-js/dom-event@0.68.1
  - @zag-js/dom-query@0.68.1
  - @zag-js/form-utils@0.68.1
  - @zag-js/popper@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies [[`74d1848`](https://github.com/chakra-ui/zag/commit/74d18489fb64d53539fc62e5cfce7c5906720254)]:
  - @zag-js/popper@0.68.0
  - @zag-js/anatomy@0.68.0
  - @zag-js/core@0.68.0
  - @zag-js/types@0.68.0
  - @zag-js/collection@0.68.0
  - @zag-js/utils@0.68.0
  - @zag-js/dismissable@0.68.0
  - @zag-js/dom-event@0.68.0
  - @zag-js/dom-query@0.68.0
  - @zag-js/form-utils@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.67.0
  - @zag-js/core@0.67.0
  - @zag-js/types@0.67.0
  - @zag-js/collection@0.67.0
  - @zag-js/utils@0.67.0
  - @zag-js/dismissable@0.67.0
  - @zag-js/dom-event@0.67.0
  - @zag-js/dom-query@0.67.0
  - @zag-js/form-utils@0.67.0
  - @zag-js/popper@0.67.0

## 0.66.1

### Patch Changes

- [`664fd91`](https://github.com/chakra-ui/zag/commit/664fd91ebd289ea7d698952b8d3176328e4d6e95) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix regression where select doesn't restore focus to trigger on
  keyboard selection

- Updated dependencies []:
  - @zag-js/anatomy@0.66.1
  - @zag-js/core@0.66.1
  - @zag-js/types@0.66.1
  - @zag-js/collection@0.66.1
  - @zag-js/utils@0.66.1
  - @zag-js/dismissable@0.66.1
  - @zag-js/dom-event@0.66.1
  - @zag-js/dom-query@0.66.1
  - @zag-js/form-utils@0.66.1
  - @zag-js/popper@0.66.1

## 0.66.0

### Patch Changes

- [`44628a1`](https://github.com/chakra-ui/zag/commit/44628a119e957e07d0bdd96f3ad84a3b4d1bbac7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor opening and selection to be based on click events rather
  than pointerdown/up cycles.

  This improves the usability and accessibility of the select component. It also fixes an issue where controlled
  multiple selects open state behaved unexpectedly.

- Updated dependencies [[`54094ab`](https://github.com/chakra-ui/zag/commit/54094ab5005301b1f00ce062a7298b2399fa2b31)]:
  - @zag-js/popper@0.66.0
  - @zag-js/dismissable@0.66.0
  - @zag-js/anatomy@0.66.0
  - @zag-js/core@0.66.0
  - @zag-js/types@0.66.0
  - @zag-js/collection@0.66.0
  - @zag-js/utils@0.66.0
  - @zag-js/dom-event@0.66.0
  - @zag-js/dom-query@0.66.0
  - @zag-js/form-utils@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.1
  - @zag-js/core@0.65.1
  - @zag-js/types@0.65.1
  - @zag-js/collection@0.65.1
  - @zag-js/utils@0.65.1
  - @zag-js/dismissable@0.65.1
  - @zag-js/dom-event@0.65.1
  - @zag-js/dom-query@0.65.1
  - @zag-js/form-utils@0.65.1
  - @zag-js/popper@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.0
  - @zag-js/core@0.65.0
  - @zag-js/types@0.65.0
  - @zag-js/collection@0.65.0
  - @zag-js/utils@0.65.0
  - @zag-js/dismissable@0.65.0
  - @zag-js/dom-event@0.65.0
  - @zag-js/dom-query@0.65.0
  - @zag-js/form-utils@0.65.0
  - @zag-js/popper@0.65.0

## 0.64.0

### Minor Changes

- [`c1a9ea7`](https://github.com/chakra-ui/zag/commit/c1a9ea763a7d74d31d63b57c2e2f66bd8deaf42b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING: Rename `Collection` class to `ListCollection` to better
  reflect its intent.

### Patch Changes

- Updated dependencies [[`c1a9ea7`](https://github.com/chakra-ui/zag/commit/c1a9ea763a7d74d31d63b57c2e2f66bd8deaf42b)]:
  - @zag-js/collection@0.64.0
  - @zag-js/anatomy@0.64.0
  - @zag-js/core@0.64.0
  - @zag-js/types@0.64.0
  - @zag-js/utils@0.64.0
  - @zag-js/dismissable@0.64.0
  - @zag-js/dom-event@0.64.0
  - @zag-js/dom-query@0.64.0
  - @zag-js/form-utils@0.64.0
  - @zag-js/popper@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies [[`ca437b9`](https://github.com/chakra-ui/zag/commit/ca437b94b49760742bad69aa57a3d6527219782a)]:
  - @zag-js/dom-query@0.63.0
  - @zag-js/dismissable@0.63.0
  - @zag-js/dom-event@0.63.0
  - @zag-js/popper@0.63.0
  - @zag-js/anatomy@0.63.0
  - @zag-js/core@0.63.0
  - @zag-js/types@0.63.0
  - @zag-js/collection@0.63.0
  - @zag-js/utils@0.63.0
  - @zag-js/form-utils@0.63.0

## 0.62.1

### Patch Changes

- Updated dependencies [[`5644790`](https://github.com/chakra-ui/zag/commit/564479081d37cd06bc38043fccf9c229379a1531)]:
  - @zag-js/core@0.62.1
  - @zag-js/anatomy@0.62.1
  - @zag-js/types@0.62.1
  - @zag-js/collection@0.62.1
  - @zag-js/utils@0.62.1
  - @zag-js/dismissable@0.62.1
  - @zag-js/dom-event@0.62.1
  - @zag-js/dom-query@0.62.1
  - @zag-js/form-utils@0.62.1
  - @zag-js/popper@0.62.1

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.62.0
  - @zag-js/core@0.62.0
  - @zag-js/types@0.62.0
  - @zag-js/collection@0.62.0
  - @zag-js/utils@0.62.0
  - @zag-js/dismissable@0.62.0
  - @zag-js/dom-event@0.62.0
  - @zag-js/dom-query@0.62.0
  - @zag-js/form-utils@0.62.0
  - @zag-js/popper@0.62.0

## 0.61.1

### Patch Changes

- [`338859e`](https://github.com/chakra-ui/zag/commit/338859e34ed669d33a55fa818ec234a35dc8cb5e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `closeOnSelect` could not be customized when
  `multiple` is set to `true`

- Updated dependencies []:
  - @zag-js/anatomy@0.61.1
  - @zag-js/core@0.61.1
  - @zag-js/types@0.61.1
  - @zag-js/collection@0.61.1
  - @zag-js/utils@0.61.1
  - @zag-js/dismissable@0.61.1
  - @zag-js/dom-event@0.61.1
  - @zag-js/dom-query@0.61.1
  - @zag-js/form-utils@0.61.1
  - @zag-js/popper@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.0
  - @zag-js/core@0.61.0
  - @zag-js/types@0.61.0
  - @zag-js/collection@0.61.0
  - @zag-js/utils@0.61.0
  - @zag-js/dismissable@0.61.0
  - @zag-js/dom-event@0.61.0
  - @zag-js/dom-query@0.61.0
  - @zag-js/form-utils@0.61.0
  - @zag-js/popper@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.60.0
  - @zag-js/anatomy@0.60.0
  - @zag-js/types@0.60.0
  - @zag-js/collection@0.60.0
  - @zag-js/utils@0.60.0
  - @zag-js/dismissable@0.60.0
  - @zag-js/dom-event@0.60.0
  - @zag-js/dom-query@0.60.0
  - @zag-js/form-utils@0.60.0
  - @zag-js/popper@0.60.0

## 0.59.0

### Minor Changes

- [`8fa3e08`](https://github.com/chakra-ui/zag/commit/8fa3e0800721ba5f84ca839386b96c1958158290) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for valueText part for rendering internal state value

### Patch Changes

- [#1625](https://github.com/chakra-ui/zag/pull/1625)
  [`1441d06`](https://github.com/chakra-ui/zag/commit/1441d06c03e0fc3958c8b25821b19db2398549dc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve reliability of select and combobox by redesigning the
  collection interface

- Updated dependencies [[`1441d06`](https://github.com/chakra-ui/zag/commit/1441d06c03e0fc3958c8b25821b19db2398549dc)]:
  - @zag-js/collection@0.59.0
  - @zag-js/anatomy@0.59.0
  - @zag-js/core@0.59.0
  - @zag-js/types@0.59.0
  - @zag-js/utils@0.59.0
  - @zag-js/dismissable@0.59.0
  - @zag-js/dom-event@0.59.0
  - @zag-js/dom-query@0.59.0
  - @zag-js/form-utils@0.59.0
  - @zag-js/popper@0.59.0

## 0.58.3

### Patch Changes

- [#1622](https://github.com/chakra-ui/zag/pull/1622)
  [`f57eb81`](https://github.com/chakra-ui/zag/commit/f57eb81a06248449bf303bbdb7af83a0383d4f84) Thanks
  [@Jonas-C](https://github.com/Jonas-C)! - Expose `data-invalid` on Combobox and Select triggers

- [#1621](https://github.com/chakra-ui/zag/pull/1621)
  [`1f7ea87`](https://github.com/chakra-ui/zag/commit/1f7ea87a34e19f9bd2119a13a7d8b7a7498609e4) Thanks
  [@Jonas-C](https://github.com/Jonas-C)! - Expose `data-state` on `ItemText` for Combobox and Select

- Updated dependencies []:
  - @zag-js/anatomy@0.58.3
  - @zag-js/core@0.58.3
  - @zag-js/types@0.58.3
  - @zag-js/collection@0.58.3
  - @zag-js/utils@0.58.3
  - @zag-js/dismissable@0.58.3
  - @zag-js/dom-event@0.58.3
  - @zag-js/dom-query@0.58.3
  - @zag-js/form-utils@0.58.3
  - @zag-js/popper@0.58.3

## 0.58.2

### Patch Changes

- [`685e7a1`](https://github.com/chakra-ui/zag/commit/685e7a13db15fed3f388f176c87c12fdad267590) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure form related components have the `required` property

- Updated dependencies []:
  - @zag-js/anatomy@0.58.2
  - @zag-js/core@0.58.2
  - @zag-js/types@0.58.2
  - @zag-js/collection@0.58.2
  - @zag-js/utils@0.58.2
  - @zag-js/dismissable@0.58.2
  - @zag-js/dom-event@0.58.2
  - @zag-js/dom-query@0.58.2
  - @zag-js/form-utils@0.58.2
  - @zag-js/popper@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.1
  - @zag-js/core@0.58.1
  - @zag-js/types@0.58.1
  - @zag-js/collection@0.58.1
  - @zag-js/utils@0.58.1
  - @zag-js/dismissable@0.58.1
  - @zag-js/dom-event@0.58.1
  - @zag-js/dom-query@0.58.1
  - @zag-js/form-utils@0.58.1
  - @zag-js/popper@0.58.1

## 0.58.0

### Minor Changes

- [`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Ensure consistent application of form related properties like
  `invalid`, `required`, and `readOnly`
  - Export `Service` from all machines for use in Lit based components.

### Patch Changes

- Updated dependencies [[`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93)]:
  - @zag-js/dom-query@0.58.0
  - @zag-js/dismissable@0.58.0
  - @zag-js/dom-event@0.58.0
  - @zag-js/popper@0.58.0
  - @zag-js/anatomy@0.58.0
  - @zag-js/core@0.58.0
  - @zag-js/types@0.58.0
  - @zag-js/collection@0.58.0
  - @zag-js/utils@0.58.0
  - @zag-js/form-utils@0.58.0

## 0.57.0

### Minor Changes

- [`761f185`](https://github.com/chakra-ui/zag/commit/761f185bc0e3fa337fcde6d3eeaae8e4a00ac00b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for selecting all values using `api.selectAll()`

### Patch Changes

- Updated dependencies [[`761f185`](https://github.com/chakra-ui/zag/commit/761f185bc0e3fa337fcde6d3eeaae8e4a00ac00b)]:
  - @zag-js/collection@0.57.0
  - @zag-js/dismissable@0.57.0
  - @zag-js/anatomy@0.57.0
  - @zag-js/core@0.57.0
  - @zag-js/types@0.57.0
  - @zag-js/utils@0.57.0
  - @zag-js/dom-event@0.57.0
  - @zag-js/dom-query@0.57.0
  - @zag-js/form-utils@0.57.0
  - @zag-js/popper@0.57.0

## 0.56.1

### Patch Changes

- [`09189fb`](https://github.com/chakra-ui/zag/commit/09189fbdc9a885ec4dfab46be1ce7263c74c5e29) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure consistent handling of `readOnly` and `disabled` context
  properties

- Updated dependencies []:
  - @zag-js/anatomy@0.56.1
  - @zag-js/core@0.56.1
  - @zag-js/types@0.56.1
  - @zag-js/collection@0.56.1
  - @zag-js/utils@0.56.1
  - @zag-js/dismissable@0.56.1
  - @zag-js/dom-event@0.56.1
  - @zag-js/dom-query@0.56.1
  - @zag-js/form-utils@0.56.1
  - @zag-js/popper@0.56.1

## 0.56.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.0
  - @zag-js/core@0.56.0
  - @zag-js/types@0.56.0
  - @zag-js/collection@0.56.0
  - @zag-js/utils@0.56.0
  - @zag-js/dismissable@0.56.0
  - @zag-js/dom-event@0.56.0
  - @zag-js/dom-query@0.56.0
  - @zag-js/form-utils@0.56.0
  - @zag-js/popper@0.56.0

## 0.55.0

### Patch Changes

- [`5dca143`](https://github.com/chakra-ui/zag/commit/5dca1437d68878379210511304a2b29ff7b50165) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Add missing list part

- Updated dependencies []:
  - @zag-js/anatomy@0.55.0
  - @zag-js/core@0.55.0
  - @zag-js/types@0.55.0
  - @zag-js/collection@0.55.0
  - @zag-js/utils@0.55.0
  - @zag-js/dismissable@0.55.0
  - @zag-js/dom-event@0.55.0
  - @zag-js/dom-query@0.55.0
  - @zag-js/form-utils@0.55.0
  - @zag-js/popper@0.55.0

## 0.54.0

### Patch Changes

- Updated dependencies [[`590c177`](https://github.com/chakra-ui/zag/commit/590c1779f5208fb99114c872175e779508f2f96d)]:
  - @zag-js/core@0.54.0
  - @zag-js/anatomy@0.54.0
  - @zag-js/types@0.54.0
  - @zag-js/collection@0.54.0
  - @zag-js/utils@0.54.0
  - @zag-js/dismissable@0.54.0
  - @zag-js/dom-event@0.54.0
  - @zag-js/dom-query@0.54.0
  - @zag-js/form-utils@0.54.0
  - @zag-js/popper@0.54.0

## 0.53.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.53.0
  - @zag-js/core@0.53.0
  - @zag-js/types@0.53.0
  - @zag-js/collection@0.53.0
  - @zag-js/utils@0.53.0
  - @zag-js/dismissable@0.53.0
  - @zag-js/dom-event@0.53.0
  - @zag-js/dom-query@0.53.0
  - @zag-js/form-utils@0.53.0
  - @zag-js/popper@0.53.0

## 0.52.0

### Patch Changes

- Updated dependencies [[`390f2c0`](https://github.com/chakra-ui/zag/commit/390f2c0ae813c93ae8513c515295f8ca3be4c10b)]:
  - @zag-js/collection@0.52.0
  - @zag-js/anatomy@0.52.0
  - @zag-js/core@0.52.0
  - @zag-js/types@0.52.0
  - @zag-js/utils@0.52.0
  - @zag-js/dismissable@0.52.0
  - @zag-js/dom-event@0.52.0
  - @zag-js/dom-query@0.52.0
  - @zag-js/form-utils@0.52.0
  - @zag-js/popper@0.52.0

## 0.51.2

### Patch Changes

- [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where keydown event might not fire in React due to
  `nativeEvent` currentTarget not been set sometimes.

- Updated dependencies [[`62eb21b`](https://github.com/chakra-ui/zag/commit/62eb21b60355dd0645936baf4692315134e7488c),
  [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc)]:
  - @zag-js/core@0.51.2
  - @zag-js/dom-event@0.51.2
  - @zag-js/dom-query@0.51.2
  - @zag-js/dismissable@0.51.2
  - @zag-js/popper@0.51.2
  - @zag-js/anatomy@0.51.2
  - @zag-js/types@0.51.2
  - @zag-js/collection@0.51.2
  - @zag-js/utils@0.51.2
  - @zag-js/form-utils@0.51.2

## 0.51.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.1
  - @zag-js/core@0.51.1
  - @zag-js/types@0.51.1
  - @zag-js/collection@0.51.1
  - @zag-js/utils@0.51.1
  - @zag-js/dismissable@0.51.1
  - @zag-js/dom-event@0.51.1
  - @zag-js/dom-query@0.51.1
  - @zag-js/form-utils@0.51.1
  - @zag-js/popper@0.51.1

## 0.51.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.0
  - @zag-js/core@0.51.0
  - @zag-js/types@0.51.0
  - @zag-js/collection@0.51.0
  - @zag-js/utils@0.51.0
  - @zag-js/dismissable@0.51.0
  - @zag-js/dom-event@0.51.0
  - @zag-js/dom-query@0.51.0
  - @zag-js/form-utils@0.51.0
  - @zag-js/popper@0.51.0

## 0.50.0

### Patch Changes

- Updated dependencies [[`8f325a8`](https://github.com/chakra-ui/zag/commit/8f325a8a966256c45410ed3e953d7f041d40b658),
  [`6784564`](https://github.com/chakra-ui/zag/commit/678456443f1ae958bb93bee8448e04a4ff2ce238)]:
  - @zag-js/collection@0.50.0
  - @zag-js/popper@0.50.0
  - @zag-js/anatomy@0.50.0
  - @zag-js/core@0.50.0
  - @zag-js/types@0.50.0
  - @zag-js/utils@0.50.0
  - @zag-js/dismissable@0.50.0
  - @zag-js/dom-event@0.50.0
  - @zag-js/dom-query@0.50.0
  - @zag-js/form-utils@0.50.0

## 0.49.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.49.0
  - @zag-js/anatomy@0.49.0
  - @zag-js/types@0.49.0
  - @zag-js/collection@0.49.0
  - @zag-js/utils@0.49.0
  - @zag-js/dismissable@0.49.0
  - @zag-js/dom-event@0.49.0
  - @zag-js/dom-query@0.49.0
  - @zag-js/form-utils@0.49.0
  - @zag-js/popper@0.49.0

## 0.48.0

### Minor Changes

- [#1431](https://github.com/chakra-ui/zag/pull/1431)
  [`80b97a9`](https://github.com/chakra-ui/zag/commit/80b97a907382f0cece781abeae2a462f9bfba686) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `loop` to `loopFocus` to better reflect its purpose

- [#1431](https://github.com/chakra-ui/zag/pull/1431)
  [`80b97a9`](https://github.com/chakra-ui/zag/commit/80b97a907382f0cece781abeae2a462f9bfba686) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove `selectOnBlur` to prevent accidental selection of options.
  Prefer explicit selection by user via click or enter key.

### Patch Changes

- Updated dependencies [[`ed0ee38`](https://github.com/chakra-ui/zag/commit/ed0ee38da9bea2ec7d7aa46ba5c1bc11d8dadb1d)]:
  - @zag-js/collection@0.48.0
  - @zag-js/anatomy@0.48.0
  - @zag-js/core@0.48.0
  - @zag-js/types@0.48.0
  - @zag-js/utils@0.48.0
  - @zag-js/dismissable@0.48.0
  - @zag-js/dom-event@0.48.0
  - @zag-js/dom-query@0.48.0
  - @zag-js/form-utils@0.48.0
  - @zag-js/popper@0.48.0

## 0.47.0

### Patch Changes

- [`30528d0`](https://github.com/chakra-ui/zag/commit/30528d04563aa428d044867ce40c3ccab7cf8b7b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Prevent tab key interaction when the select is open. This keeps
  focus within the select and ensures keyboard interactions work consistently

- Updated dependencies []:
  - @zag-js/anatomy@0.47.0
  - @zag-js/core@0.47.0
  - @zag-js/types@0.47.0
  - @zag-js/collection@0.47.0
  - @zag-js/utils@0.47.0
  - @zag-js/dismissable@0.47.0
  - @zag-js/dom-event@0.47.0
  - @zag-js/dom-query@0.47.0
  - @zag-js/form-utils@0.47.0
  - @zag-js/mutation-observer@0.47.0
  - @zag-js/popper@0.47.0
  - @zag-js/visually-hidden@0.47.0

## 0.46.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.46.0
  - @zag-js/core@0.46.0
  - @zag-js/types@0.46.0
  - @zag-js/collection@0.46.0
  - @zag-js/utils@0.46.0
  - @zag-js/dismissable@0.46.0
  - @zag-js/dom-event@0.46.0
  - @zag-js/dom-query@0.46.0
  - @zag-js/form-utils@0.46.0
  - @zag-js/mutation-observer@0.46.0
  - @zag-js/popper@0.46.0
  - @zag-js/tabbable@0.46.0
  - @zag-js/visually-hidden@0.46.0

## 0.45.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.45.0
  - @zag-js/core@0.45.0
  - @zag-js/types@0.45.0
  - @zag-js/collection@0.45.0
  - @zag-js/utils@0.45.0
  - @zag-js/dismissable@0.45.0
  - @zag-js/dom-event@0.45.0
  - @zag-js/dom-query@0.45.0
  - @zag-js/form-utils@0.45.0
  - @zag-js/mutation-observer@0.45.0
  - @zag-js/popper@0.45.0
  - @zag-js/tabbable@0.45.0
  - @zag-js/visually-hidden@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.44.0
  - @zag-js/core@0.44.0
  - @zag-js/types@0.44.0
  - @zag-js/collection@0.44.0
  - @zag-js/utils@0.44.0
  - @zag-js/dismissable@0.44.0
  - @zag-js/dom-event@0.44.0
  - @zag-js/dom-query@0.44.0
  - @zag-js/form-utils@0.44.0
  - @zag-js/mutation-observer@0.44.0
  - @zag-js/popper@0.44.0
  - @zag-js/tabbable@0.44.0
  - @zag-js/visually-hidden@0.44.0

## 0.43.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.43.0
  - @zag-js/core@0.43.0
  - @zag-js/types@0.43.0
  - @zag-js/collection@0.43.0
  - @zag-js/utils@0.43.0
  - @zag-js/dismissable@0.43.0
  - @zag-js/dom-event@0.43.0
  - @zag-js/dom-query@0.43.0
  - @zag-js/form-utils@0.43.0
  - @zag-js/mutation-observer@0.43.0
  - @zag-js/popper@0.43.0
  - @zag-js/tabbable@0.43.0
  - @zag-js/visually-hidden@0.43.0

## 0.42.0

### Patch Changes

- Updated dependencies [[`6122eee`](https://github.com/chakra-ui/zag/commit/6122eee55632899cbaa3cb5505625a25df57f7ce),
  [`c55ff29`](https://github.com/chakra-ui/zag/commit/c55ff297a408779232146953daa0b5aba6e14d9e)]:
  - @zag-js/dom-event@0.42.0
  - @zag-js/tabbable@0.42.0
  - @zag-js/dismissable@0.42.0
  - @zag-js/anatomy@0.42.0
  - @zag-js/core@0.42.0
  - @zag-js/types@0.42.0
  - @zag-js/collection@0.42.0
  - @zag-js/utils@0.42.0
  - @zag-js/dom-query@0.42.0
  - @zag-js/form-utils@0.42.0
  - @zag-js/mutation-observer@0.42.0
  - @zag-js/popper@0.42.0
  - @zag-js/visually-hidden@0.42.0

## 0.41.0

### Patch Changes

- [`b55cf5a`](https://github.com/chakra-ui/zag/commit/b55cf5ac663dc3f37610150a7399f02dccf4d518) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where select doesn't work in forms when
  `readOnly: true` is set
  - Fix issue where initial value was not synced with hidden select element
- Updated dependencies [[`e47d60d`](https://github.com/chakra-ui/zag/commit/e47d60d2d9357eb24331d12f330d46e2f545f45d)]:
  - @zag-js/dismissable@0.41.0
  - @zag-js/anatomy@0.41.0
  - @zag-js/core@0.41.0
  - @zag-js/types@0.41.0
  - @zag-js/collection@0.41.0
  - @zag-js/utils@0.41.0
  - @zag-js/dom-event@0.41.0
  - @zag-js/dom-query@0.41.0
  - @zag-js/form-utils@0.41.0
  - @zag-js/mutation-observer@0.41.0
  - @zag-js/popper@0.41.0
  - @zag-js/tabbable@0.41.0
  - @zag-js/visually-hidden@0.41.0

## 0.40.0

### Minor Changes

- [`04a3b36`](https://github.com/chakra-ui/zag/commit/04a3b369bcfe644b3e408d490fd9b82ead66bee2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-placement` to the select content to make it easier to
  style

- [`5c185d4`](https://github.com/chakra-ui/zag/commit/5c185d4fb85202db40fe21f4c8e297a5fbb17874) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for `scrollToIndexFn` to be used with virtualization
  libraries
  - Add support for `highlightedIndex` in the `onHighlightChange` callback

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.40.0
  - @zag-js/core@0.40.0
  - @zag-js/types@0.40.0
  - @zag-js/collection@0.40.0
  - @zag-js/utils@0.40.0
  - @zag-js/dismissable@0.40.0
  - @zag-js/dom-event@0.40.0
  - @zag-js/dom-query@0.40.0
  - @zag-js/form-utils@0.40.0
  - @zag-js/mutation-observer@0.40.0
  - @zag-js/popper@0.40.0
  - @zag-js/tabbable@0.40.0
  - @zag-js/visually-hidden@0.40.0

## 0.39.0

### Patch Changes

- [`ce1975a`](https://github.com/chakra-ui/zag/commit/ce1975a7a3335710b8863c370ffc168d108decca) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where multiple select doesn't work correctly in forms.

- Updated dependencies [[`27f9ec0`](https://github.com/chakra-ui/zag/commit/27f9ec0812f19228921158885107ed43d559544a),
  [`565a7e4`](https://github.com/chakra-ui/zag/commit/565a7e46070edb7bb2a39ed9d065dcaee418db83)]:
  - @zag-js/dismissable@0.39.0
  - @zag-js/popper@0.39.0
  - @zag-js/anatomy@0.39.0
  - @zag-js/core@0.39.0
  - @zag-js/types@0.39.0
  - @zag-js/collection@0.39.0
  - @zag-js/utils@0.39.0
  - @zag-js/dom-event@0.39.0
  - @zag-js/dom-query@0.39.0
  - @zag-js/form-utils@0.39.0
  - @zag-js/mutation-observer@0.39.0
  - @zag-js/tabbable@0.39.0
  - @zag-js/visually-hidden@0.39.0

## 0.38.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.1
  - @zag-js/core@0.38.1
  - @zag-js/types@0.38.1
  - @zag-js/collection@0.38.1
  - @zag-js/utils@0.38.1
  - @zag-js/dismissable@0.38.1
  - @zag-js/dom-event@0.38.1
  - @zag-js/dom-query@0.38.1
  - @zag-js/form-utils@0.38.1
  - @zag-js/mutation-observer@0.38.1
  - @zag-js/popper@0.38.1
  - @zag-js/tabbable@0.38.1
  - @zag-js/visually-hidden@0.38.1

## 0.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.0
  - @zag-js/core@0.38.0
  - @zag-js/types@0.38.0
  - @zag-js/collection@0.38.0
  - @zag-js/utils@0.38.0
  - @zag-js/dismissable@0.38.0
  - @zag-js/dom-event@0.38.0
  - @zag-js/dom-query@0.38.0
  - @zag-js/form-utils@0.38.0
  - @zag-js/mutation-observer@0.38.0
  - @zag-js/popper@0.38.0
  - @zag-js/tabbable@0.38.0
  - @zag-js/visually-hidden@0.38.0

## 0.37.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.3
  - @zag-js/core@0.37.3
  - @zag-js/types@0.37.3
  - @zag-js/collection@0.37.3
  - @zag-js/utils@0.37.3
  - @zag-js/dismissable@0.37.3
  - @zag-js/dom-event@0.37.3
  - @zag-js/dom-query@0.37.3
  - @zag-js/form-utils@0.37.3
  - @zag-js/mutation-observer@0.37.3
  - @zag-js/popper@0.37.3
  - @zag-js/tabbable@0.37.3
  - @zag-js/visually-hidden@0.37.3

## 0.37.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.2
  - @zag-js/core@0.37.2
  - @zag-js/types@0.37.2
  - @zag-js/collection@0.37.2
  - @zag-js/utils@0.37.2
  - @zag-js/dismissable@0.37.2
  - @zag-js/dom-event@0.37.2
  - @zag-js/dom-query@0.37.2
  - @zag-js/form-utils@0.37.2
  - @zag-js/mutation-observer@0.37.2
  - @zag-js/popper@0.37.2
  - @zag-js/tabbable@0.37.2
  - @zag-js/visually-hidden@0.37.2

## 0.37.1

### Patch Changes

- [`d9d5263`](https://github.com/chakra-ui/zag/commit/d9d52636fbd3a731a4764b865ac82afd4f163baf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `splitProps` function to improve DX of creating custom
  components on top of Zag.js

- Updated dependencies []:
  - @zag-js/anatomy@0.37.1
  - @zag-js/core@0.37.1
  - @zag-js/types@0.37.1
  - @zag-js/collection@0.37.1
  - @zag-js/utils@0.37.1
  - @zag-js/dismissable@0.37.1
  - @zag-js/dom-event@0.37.1
  - @zag-js/dom-query@0.37.1
  - @zag-js/form-utils@0.37.1
  - @zag-js/mutation-observer@0.37.1
  - @zag-js/popper@0.37.1
  - @zag-js/tabbable@0.37.1
  - @zag-js/visually-hidden@0.37.1

## 0.37.0

### Patch Changes

- Updated dependencies [[`2a024fb`](https://github.com/chakra-ui/zag/commit/2a024fbd2e98343218d4d658e91f1d8c751e1a4d)]:
  - @zag-js/types@0.37.0
  - @zag-js/dom-event@0.37.0
  - @zag-js/dismissable@0.37.0
  - @zag-js/anatomy@0.37.0
  - @zag-js/core@0.37.0
  - @zag-js/collection@0.37.0
  - @zag-js/utils@0.37.0
  - @zag-js/dom-query@0.37.0
  - @zag-js/form-utils@0.37.0
  - @zag-js/mutation-observer@0.37.0
  - @zag-js/popper@0.37.0
  - @zag-js/tabbable@0.37.0
  - @zag-js/visually-hidden@0.37.0

## 0.36.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.3
  - @zag-js/core@0.36.3
  - @zag-js/types@0.36.3
  - @zag-js/collection@0.36.3
  - @zag-js/utils@0.36.3
  - @zag-js/dismissable@0.36.3
  - @zag-js/dom-event@0.36.3
  - @zag-js/dom-query@0.36.3
  - @zag-js/form-utils@0.36.3
  - @zag-js/mutation-observer@0.36.3
  - @zag-js/popper@0.36.3
  - @zag-js/tabbable@0.36.3
  - @zag-js/visually-hidden@0.36.3

## 0.36.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.2
  - @zag-js/core@0.36.2
  - @zag-js/types@0.36.2
  - @zag-js/collection@0.36.2
  - @zag-js/utils@0.36.2
  - @zag-js/dismissable@0.36.2
  - @zag-js/dom-event@0.36.2
  - @zag-js/dom-query@0.36.2
  - @zag-js/form-utils@0.36.2
  - @zag-js/mutation-observer@0.36.2
  - @zag-js/popper@0.36.2
  - @zag-js/tabbable@0.36.2
  - @zag-js/visually-hidden@0.36.2

## 0.36.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.1
  - @zag-js/core@0.36.1
  - @zag-js/types@0.36.1
  - @zag-js/collection@0.36.1
  - @zag-js/utils@0.36.1
  - @zag-js/dismissable@0.36.1
  - @zag-js/dom-event@0.36.1
  - @zag-js/dom-query@0.36.1
  - @zag-js/form-utils@0.36.1
  - @zag-js/mutation-observer@0.36.1
  - @zag-js/popper@0.36.1
  - @zag-js/tabbable@0.36.1
  - @zag-js/visually-hidden@0.36.1

## 0.36.0

### Minor Changes

- [`6671d75`](https://github.com/chakra-ui/zag/commit/6671d7539a647827e685b235d72aec477cc51765) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Extend tree view parts

### Patch Changes

- [`d875e55`](https://github.com/chakra-ui/zag/commit/d875e551a1aed480901d6b2d3efa3aa5263986f0) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Refactor scroll utilities to safely handle `null` element values in
  test environment.

- Updated dependencies []:
  - @zag-js/dismissable@0.36.0
  - @zag-js/anatomy@0.36.0
  - @zag-js/core@0.36.0
  - @zag-js/types@0.36.0
  - @zag-js/collection@0.36.0
  - @zag-js/utils@0.36.0
  - @zag-js/dom-event@0.36.0
  - @zag-js/dom-query@0.36.0
  - @zag-js/form-utils@0.36.0
  - @zag-js/mutation-observer@0.36.0
  - @zag-js/popper@0.36.0
  - @zag-js/tabbable@0.36.0
  - @zag-js/visually-hidden@0.36.0

## 0.35.0

### Minor Changes

- [`3881f34`](https://github.com/chakra-ui/zag/commit/3881f34622d7a6067e7a2e4eecbe83fa778bdb9e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `open.controlled` in the machine context as a way
  to fully control the machine's open state programmatically.

### Patch Changes

- [`374c065`](https://github.com/chakra-ui/zag/commit/374c0659fcb53f04fa403bc287dd0b8b092d4207) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where scrolling into view could result in scrolling the
  body element.

- [#1202](https://github.com/chakra-ui/zag/pull/1202)
  [`ca1e9df`](https://github.com/chakra-ui/zag/commit/ca1e9df907934e77a52b532b9d5460d61584394a) Thanks
  [@erm1116](https://github.com/erm1116)! - Fix issue where item group's label `id` pointed to the wrong element

- [#1227](https://github.com/chakra-ui/zag/pull/1227)
  [`99c5a68`](https://github.com/chakra-ui/zag/commit/99c5a68890058b26f1d39ac25081ab8d3a6a96b6) Thanks
  [@erm1116](https://github.com/erm1116)! - Expose `api.collection` for better control over the collection of items in
  combobox.

- [#1215](https://github.com/chakra-ui/zag/pull/1215)
  [`fa82362`](https://github.com/chakra-ui/zag/commit/fa82362a199739a95e6f0d36fb382f8d92a07947) Thanks
  [@remonke](https://github.com/remonke)! - Fix issue where select uses the incorrect `id` for `aria-activedecesendant`
  field

- Updated dependencies [[`0216161`](https://github.com/chakra-ui/zag/commit/0216161fd3d429409abc96941d33a0c333ef8d36),
  [`d206b3a`](https://github.com/chakra-ui/zag/commit/d206b3a9df7f375da640e12590939a7994f41b9e)]:
  - @zag-js/core@0.35.0
  - @zag-js/popper@0.35.0
  - @zag-js/anatomy@0.35.0
  - @zag-js/types@0.35.0
  - @zag-js/collection@0.35.0
  - @zag-js/utils@0.35.0
  - @zag-js/dismissable@0.35.0
  - @zag-js/dom-event@0.35.0
  - @zag-js/dom-query@0.35.0
  - @zag-js/form-utils@0.35.0
  - @zag-js/mutation-observer@0.35.0
  - @zag-js/tabbable@0.35.0
  - @zag-js/visually-hidden@0.35.0

## 0.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.34.0
  - @zag-js/core@0.34.0
  - @zag-js/types@0.34.0
  - @zag-js/collection@0.34.0
  - @zag-js/utils@0.34.0
  - @zag-js/dismissable@0.34.0
  - @zag-js/dom-event@0.34.0
  - @zag-js/dom-query@0.34.0
  - @zag-js/form-utils@0.34.0
  - @zag-js/mutation-observer@0.34.0
  - @zag-js/popper@0.34.0
  - @zag-js/tabbable@0.34.0
  - @zag-js/visually-hidden@0.34.0

## 0.33.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.33.2
  - @zag-js/core@0.33.2
  - @zag-js/types@0.33.2
  - @zag-js/collection@0.33.2
  - @zag-js/utils@0.33.2
  - @zag-js/dismissable@0.33.2
  - @zag-js/dom-event@0.33.2
  - @zag-js/dom-query@0.33.2
  - @zag-js/form-utils@0.33.2
  - @zag-js/mutation-observer@0.33.2
  - @zag-js/popper@0.33.2
  - @zag-js/tabbable@0.33.2
  - @zag-js/visually-hidden@0.33.2

## 0.33.1

### Patch Changes

- [#1183](https://github.com/chakra-ui/zag/pull/1183)
  [`d5d2f7f`](https://github.com/chakra-ui/zag/commit/d5d2f7f3e21091221da741766da75ccc594fafec) Thanks
  [@iNetJoJo](https://github.com/iNetJoJo)! - Add data-disabled, data-invalid, aria-invalid, data-readonly to
  indicatorProps for Select

- Updated dependencies []:
  - @zag-js/core@0.33.1
  - @zag-js/anatomy@0.33.1
  - @zag-js/types@0.33.1
  - @zag-js/collection@0.33.1
  - @zag-js/utils@0.33.1
  - @zag-js/dismissable@0.33.1
  - @zag-js/dom-event@0.33.1
  - @zag-js/dom-query@0.33.1
  - @zag-js/form-utils@0.33.1
  - @zag-js/mutation-observer@0.33.1
  - @zag-js/popper@0.33.1
  - @zag-js/tabbable@0.33.1
  - @zag-js/visually-hidden@0.33.1

## 0.33.0

### Patch Changes

- [`c7141e8`](https://github.com/chakra-ui/zag/commit/c7141e8b458c5ac95b39b38a3cd6dbd2987403c8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue on touch devices where selecting an item within
  combobox, menu, select triggers click event on element behind the portalled content.

- Updated dependencies [[`7872cdf`](https://github.com/chakra-ui/zag/commit/7872cdf8aeb28b9a30cd4a016bd12e5366054511)]:
  - @zag-js/core@0.33.0
  - @zag-js/anatomy@0.33.0
  - @zag-js/types@0.33.0
  - @zag-js/collection@0.33.0
  - @zag-js/utils@0.33.0
  - @zag-js/dismissable@0.33.0
  - @zag-js/dom-event@0.33.0
  - @zag-js/dom-query@0.33.0
  - @zag-js/form-utils@0.33.0
  - @zag-js/mutation-observer@0.33.0
  - @zag-js/popper@0.33.0
  - @zag-js/tabbable@0.33.0
  - @zag-js/visually-hidden@0.33.0

## 0.32.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.32.1
  - @zag-js/core@0.32.1
  - @zag-js/types@0.32.1
  - @zag-js/collection@0.32.1
  - @zag-js/utils@0.32.1
  - @zag-js/dismissable@0.32.1
  - @zag-js/dom-event@0.32.1
  - @zag-js/dom-query@0.32.1
  - @zag-js/form-utils@0.32.1
  - @zag-js/mutation-observer@0.32.1
  - @zag-js/popper@0.32.1
  - @zag-js/tabbable@0.32.1
  - @zag-js/visually-hidden@0.32.1

## 0.32.0

### Patch Changes

- Updated dependencies [[`651346b`](https://github.com/chakra-ui/zag/commit/651346b1cd280b3882253425e9054caf985f83a7)]:
  - @zag-js/collection@0.32.0
  - @zag-js/anatomy@0.32.0
  - @zag-js/core@0.32.0
  - @zag-js/types@0.32.0
  - @zag-js/utils@0.32.0
  - @zag-js/dismissable@0.32.0
  - @zag-js/dom-event@0.32.0
  - @zag-js/dom-query@0.32.0
  - @zag-js/form-utils@0.32.0
  - @zag-js/mutation-observer@0.32.0
  - @zag-js/popper@0.32.0
  - @zag-js/tabbable@0.32.0
  - @zag-js/visually-hidden@0.32.0

## 0.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.1
  - @zag-js/core@0.31.1
  - @zag-js/types@0.31.1
  - @zag-js/collection@0.31.1
  - @zag-js/utils@0.31.1
  - @zag-js/dismissable@0.31.1
  - @zag-js/dom-event@0.31.1
  - @zag-js/dom-query@0.31.1
  - @zag-js/form-utils@0.31.1
  - @zag-js/mutation-observer@0.31.1
  - @zag-js/popper@0.31.1
  - @zag-js/tabbable@0.31.1
  - @zag-js/visually-hidden@0.31.1

## 0.31.0

### Patch Changes

- Updated dependencies [[`1b636579`](https://github.com/chakra-ui/zag/commit/1b63657923c69350e2f148e3ab9f22bc384af4a4)]:
  - @zag-js/popper@0.31.0
  - @zag-js/anatomy@0.31.0
  - @zag-js/core@0.31.0
  - @zag-js/types@0.31.0
  - @zag-js/collection@0.31.0
  - @zag-js/utils@0.31.0
  - @zag-js/dismissable@0.31.0
  - @zag-js/dom-event@0.31.0
  - @zag-js/dom-query@0.31.0
  - @zag-js/form-utils@0.31.0
  - @zag-js/mutation-observer@0.31.0
  - @zag-js/tabbable@0.31.0
  - @zag-js/visually-hidden@0.31.0

## 0.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.30.0
  - @zag-js/core@0.30.0
  - @zag-js/types@0.30.0
  - @zag-js/collection@0.30.0
  - @zag-js/utils@0.30.0
  - @zag-js/dismissable@0.30.0
  - @zag-js/dom-event@0.30.0
  - @zag-js/dom-query@0.30.0
  - @zag-js/form-utils@0.30.0
  - @zag-js/mutation-observer@0.30.0
  - @zag-js/popper@0.30.0
  - @zag-js/tabbable@0.30.0
  - @zag-js/visually-hidden@0.30.0

## 0.29.0

### Minor Changes

- [`b34c87f3`](https://github.com/chakra-ui/zag/commit/b34c87f30dd2803fa42551eac135b712814d661c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose more internal for better DX when building component
  libraries.

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.29.0
  - @zag-js/core@0.29.0
  - @zag-js/types@0.29.0
  - @zag-js/collection@0.29.0
  - @zag-js/utils@0.29.0
  - @zag-js/dismissable@0.29.0
  - @zag-js/dom-event@0.29.0
  - @zag-js/dom-query@0.29.0
  - @zag-js/form-utils@0.29.0
  - @zag-js/mutation-observer@0.29.0
  - @zag-js/popper@0.29.0
  - @zag-js/tabbable@0.29.0
  - @zag-js/visually-hidden@0.29.0

## 0.28.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.28.1
  - @zag-js/core@0.28.1
  - @zag-js/types@0.28.1
  - @zag-js/collection@0.28.1
  - @zag-js/utils@0.28.1
  - @zag-js/dismissable@0.28.1
  - @zag-js/dom-event@0.28.1
  - @zag-js/dom-query@0.28.1
  - @zag-js/form-utils@0.28.1
  - @zag-js/mutation-observer@0.28.1
  - @zag-js/popper@0.28.1
  - @zag-js/tabbable@0.28.1
  - @zag-js/visually-hidden@0.28.1

## 0.28.0

### Patch Changes

- [#954](https://github.com/chakra-ui/zag/pull/954)
  [`19b182ca`](https://github.com/chakra-ui/zag/commit/19b182ca73e97582938ae176ea16a1f191a7a505) Thanks
  [@acd02](https://github.com/acd02)! - fix: select machine

- Updated dependencies [[`e433b3ee`](https://github.com/chakra-ui/zag/commit/e433b3ee5b49a1099b8be2df99a4a5056fc1ecfd)]:
  - @zag-js/utils@0.28.0
  - @zag-js/core@0.28.0
  - @zag-js/dismissable@0.28.0
  - @zag-js/popper@0.28.0
  - @zag-js/anatomy@0.28.0
  - @zag-js/types@0.28.0
  - @zag-js/collection@0.28.0
  - @zag-js/dom-event@0.28.0
  - @zag-js/dom-query@0.28.0
  - @zag-js/form-utils@0.28.0
  - @zag-js/mutation-observer@0.28.0
  - @zag-js/tabbable@0.28.0
  - @zag-js/visually-hidden@0.28.0

## 0.27.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.27.1
  - @zag-js/core@0.27.1
  - @zag-js/types@0.27.1
  - @zag-js/collection@0.27.1
  - @zag-js/utils@0.27.1
  - @zag-js/dismissable@0.27.1
  - @zag-js/dom-event@0.27.1
  - @zag-js/dom-query@0.27.1
  - @zag-js/form-utils@0.27.1
  - @zag-js/mutation-observer@0.27.1
  - @zag-js/popper@0.27.1
  - @zag-js/tabbable@0.27.1
  - @zag-js/visually-hidden@0.27.1

## 0.27.0

### Patch Changes

- [`3f7ea393`](https://github.com/chakra-ui/zag/commit/3f7ea3936cb86231a105f5d919aff44ddaea60e1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `collection` is not returned in the `api`

- Updated dependencies [[`152b0a78`](https://github.com/chakra-ui/zag/commit/152b0a78b6ba18442f38164ce90789bc243f6e00)]:
  - @zag-js/core@0.27.0
  - @zag-js/anatomy@0.27.0
  - @zag-js/types@0.27.0
  - @zag-js/collection@0.27.0
  - @zag-js/utils@0.27.0
  - @zag-js/dismissable@0.27.0
  - @zag-js/dom-event@0.27.0
  - @zag-js/dom-query@0.27.0
  - @zag-js/form-utils@0.27.0
  - @zag-js/mutation-observer@0.27.0
  - @zag-js/popper@0.27.0
  - @zag-js/tabbable@0.27.0
  - @zag-js/visually-hidden@0.27.0

## 0.26.0

### Patch Changes

- [`041a9e00`](https://github.com/chakra-ui/zag/commit/041a9e00e503ce62a198db45ea7b757de7c39263) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `dir` attribute was not applied to all element
  parts

- Updated dependencies []:
  - @zag-js/anatomy@0.26.0
  - @zag-js/core@0.26.0
  - @zag-js/types@0.26.0
  - @zag-js/collection@0.26.0
  - @zag-js/utils@0.26.0
  - @zag-js/dismissable@0.26.0
  - @zag-js/dom-event@0.26.0
  - @zag-js/dom-query@0.26.0
  - @zag-js/form-utils@0.26.0
  - @zag-js/mutation-observer@0.26.0
  - @zag-js/popper@0.26.0
  - @zag-js/tabbable@0.26.0
  - @zag-js/visually-hidden@0.26.0

## 0.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.25.0
  - @zag-js/core@0.25.0
  - @zag-js/types@0.25.0
  - @zag-js/collection@0.25.0
  - @zag-js/utils@0.25.0
  - @zag-js/dismissable@0.25.0
  - @zag-js/dom-event@0.25.0
  - @zag-js/dom-query@0.25.0
  - @zag-js/form-utils@0.25.0
  - @zag-js/mutation-observer@0.25.0
  - @zag-js/popper@0.25.0
  - @zag-js/tabbable@0.25.0
  - @zag-js/visually-hidden@0.25.0

## 0.24.0

### Minor Changes

- [`51712f4b`](https://github.com/chakra-ui/zag/commit/51712f4b22fe977bc02dabeda0350cdce5772619) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `api.setPositioning` to `api.reposition`

### Patch Changes

- Updated dependencies [[`51712f4b`](https://github.com/chakra-ui/zag/commit/51712f4b22fe977bc02dabeda0350cdce5772619)]:
  - @zag-js/popper@0.24.0
  - @zag-js/anatomy@0.24.0
  - @zag-js/core@0.24.0
  - @zag-js/types@0.24.0
  - @zag-js/collection@0.24.0
  - @zag-js/utils@0.24.0
  - @zag-js/dismissable@0.24.0
  - @zag-js/dom-event@0.24.0
  - @zag-js/dom-query@0.24.0
  - @zag-js/form-utils@0.24.0
  - @zag-js/mutation-observer@0.24.0
  - @zag-js/tabbable@0.24.0
  - @zag-js/visually-hidden@0.24.0

## 0.23.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.23.0
  - @zag-js/core@0.23.0
  - @zag-js/types@0.23.0
  - @zag-js/collection@0.23.0
  - @zag-js/utils@0.23.0
  - @zag-js/dismissable@0.23.0
  - @zag-js/dom-event@0.23.0
  - @zag-js/dom-query@0.23.0
  - @zag-js/form-utils@0.23.0
  - @zag-js/mutation-observer@0.23.0
  - @zag-js/popper@0.23.0
  - @zag-js/tabbable@0.23.0
  - @zag-js/visually-hidden@0.23.0

## 0.22.0

### Minor Changes

- [`fccc9de5`](https://github.com/chakra-ui/zag/commit/fccc9de5be5534967c44379e8eb5d316d6828b38) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for repositining the content

### Patch Changes

- Updated dependencies [[`6d439ac2`](https://github.com/chakra-ui/zag/commit/6d439ac2171d3158e8ba43dcc35f84e52707dae6)]:
  - @zag-js/dismissable@0.22.0
  - @zag-js/anatomy@0.22.0
  - @zag-js/core@0.22.0
  - @zag-js/types@0.22.0
  - @zag-js/collection@0.22.0
  - @zag-js/utils@0.22.0
  - @zag-js/dom-event@0.22.0
  - @zag-js/dom-query@0.22.0
  - @zag-js/form-utils@0.22.0
  - @zag-js/mutation-observer@0.22.0
  - @zag-js/popper@0.22.0
  - @zag-js/tabbable@0.22.0
  - @zag-js/visually-hidden@0.22.0

## 0.21.0

### Minor Changes

- [#882](https://github.com/chakra-ui/zag/pull/882)
  [`fd71ad98`](https://github.com/chakra-ui/zag/commit/fd71ad98660fce3dd06c6dc2fa01e913ae7c3992) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Refactor component anatomy to use consistent naming convention
  across all machines.
  - **Accordion**
    - `getTriggerProps` => `getItemTriggerProps`
    - `getContentProps` => `getItemContentProps`

  - **Radio**
    - `getRadioProps` => `getItemProps`
    - `getRadioControlProps` => `getItemControlProps`
    - `getRadioLabelProps` => `getItemTextProps`
    - `getRatingState` => `getItemState`
    - `getRatingProps` => `getItemProps`

  - **TagsInput**
    - `getTagProps` => `getItemProps`
    - `getTagDeleteTriggerProps` => `getItemDeleteTriggerProps`
    - `getTagInputProps` => `getItemInputProps`

  - **Toggle Group**
    - `getToggleProps` => `getItemProps`
  - **ToggleGroup**: Allow deselecting item when `multiple` is `false`.
  - Add indicator part to some components for ease of styling. Added `AccordionItemIndicator`, `SelectIndicator`,
    `MenuIndicator`, `PopoverIndicator`

### Patch Changes

- Updated dependencies [[`e9d425c4`](https://github.com/chakra-ui/zag/commit/e9d425c427e0b9386680c8e7906f71a8c9a45978),
  [`c2804903`](https://github.com/chakra-ui/zag/commit/c2804903811a29d4acfb697c8a098c74b2a5688b)]:
  - @zag-js/popper@0.21.0
  - @zag-js/collection@0.21.0
  - @zag-js/anatomy@0.21.0
  - @zag-js/core@0.21.0
  - @zag-js/types@0.21.0
  - @zag-js/utils@0.21.0
  - @zag-js/dismissable@0.21.0
  - @zag-js/dom-event@0.21.0
  - @zag-js/dom-query@0.21.0
  - @zag-js/form-utils@0.21.0
  - @zag-js/mutation-observer@0.21.0
  - @zag-js/tabbable@0.21.0
  - @zag-js/visually-hidden@0.21.0

## 0.20.0

### Minor Changes

- [#862](https://github.com/chakra-ui/zag/pull/862)
  [`9a3a82f0`](https://github.com/chakra-ui/zag/commit/9a3a82f0b3738beda59c313fafd51360e6b0322f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING: Unify all callbacks to follow a consistent naming
  convention

### Patch Changes

- [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove toggle machine

- Updated dependencies [[`9a3a82f0`](https://github.com/chakra-ui/zag/commit/9a3a82f0b3738beda59c313fafd51360e6b0322f),
  [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85)]:
  - @zag-js/types@0.20.0
  - @zag-js/anatomy@0.20.0
  - @zag-js/core@0.20.0
  - @zag-js/collection@0.20.0
  - @zag-js/utils@0.20.0
  - @zag-js/dismissable@0.20.0
  - @zag-js/dom-event@0.20.0
  - @zag-js/dom-query@0.20.0
  - @zag-js/form-utils@0.20.0
  - @zag-js/mutation-observer@0.20.0
  - @zag-js/popper@0.20.0
  - @zag-js/tabbable@0.20.0
  - @zag-js/visually-hidden@0.20.0

## 0.19.1

### Patch Changes

- [`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve generic usage across api and context

- [`617f0dd8`](https://github.com/chakra-ui/zag/commit/617f0dd8587e1903410a461538e6fad9de245ad8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Export `CollectionItem` from select and combobox

- [`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where change callbacks could be executed excessively
  when no value changed.

- Updated dependencies [[`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016),
  [`3f0b6a19`](https://github.com/chakra-ui/zag/commit/3f0b6a19dcf9779846efb2bc093235299301bbdb)]:
  - @zag-js/collection@0.19.1
  - @zag-js/utils@0.19.1
  - @zag-js/core@0.19.1
  - @zag-js/dismissable@0.19.1
  - @zag-js/popper@0.19.1
  - @zag-js/anatomy@0.19.1
  - @zag-js/types@0.19.1
  - @zag-js/dom-event@0.19.1
  - @zag-js/dom-query@0.19.1
  - @zag-js/form-utils@0.19.1
  - @zag-js/mutation-observer@0.19.1
  - @zag-js/tabbable@0.19.1
  - @zag-js/visually-hidden@0.19.1

## 0.19.0

### Minor Changes

- [#839](https://github.com/chakra-ui/zag/pull/839)
  [`dca474b9`](https://github.com/chakra-ui/zag/commit/dca474b93fee1501a0a7b15dbcbd64f9addbb178) Thanks
  [@cschroeter](https://github.com/cschroeter)! - - Add `control` and `root` parts to select and combobox components
  - Add combobox content element to the dismissable layer stack

### Patch Changes

- [`e4d78be4`](https://github.com/chakra-ui/zag/commit/e4d78be47b4b46e97be943b78561213b022c692c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Loosen the collection item types to allow string item
  - Add generic to select and combobox context and api
- Updated dependencies [[`e4d78be4`](https://github.com/chakra-ui/zag/commit/e4d78be47b4b46e97be943b78561213b022c692c),
  [`8845d75a`](https://github.com/chakra-ui/zag/commit/8845d75a72f6d082e1566fe7e65e76e343b60971),
  [`4c578aab`](https://github.com/chakra-ui/zag/commit/4c578aab2d330405077bb790e884f968b6b5703f)]:
  - @zag-js/collection@0.19.0
  - @zag-js/popper@0.19.0
  - @zag-js/form-utils@0.19.0
  - @zag-js/anatomy@0.19.0
  - @zag-js/core@0.19.0
  - @zag-js/types@0.19.0
  - @zag-js/utils@0.19.0
  - @zag-js/dismissable@0.19.0
  - @zag-js/dom-event@0.19.0
  - @zag-js/dom-query@0.19.0
  - @zag-js/mutation-observer@0.19.0
  - @zag-js/tabbable@0.19.0
  - @zag-js/visually-hidden@0.19.0

## 0.18.0

### Minor Changes

- [#826](https://github.com/chakra-ui/zag/pull/826)
  [`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - > Breaking Changes 💥

  Redesign select and combobox API to allow passing value as `string` and `collection`

  Prior to this change, Zag computes the label and value from the DOM element. While this worked, it makes it
  challenging to manage complex objects that don't match the `label` and `value` convention.

  ```jsx
  // Create the collection
  const collection = select.collection({
    items: [],
    itemToString(item) {
      return item.label
    },
    itemToValue(item) {
      return item.value
    },
  })

  // Pass the collection to the select machine
  const [state, send] = useMachine(
    select.machine({
      collection,
      id: useId(),
    }),
  )
  ```

### Patch Changes

- Updated dependencies [[`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa)]:
  - @zag-js/utils@0.18.0
  - @zag-js/core@0.18.0
  - @zag-js/dismissable@0.18.0
  - @zag-js/popper@0.18.0
  - @zag-js/anatomy@0.18.0
  - @zag-js/types@0.18.0
  - @zag-js/collection@0.18.0
  - @zag-js/dom-event@0.18.0
  - @zag-js/dom-query@0.18.0
  - @zag-js/form-utils@0.18.0
  - @zag-js/mutation-observer@0.18.0
  - @zag-js/tabbable@0.18.0
  - @zag-js/visually-hidden@0.18.0

## 0.17.0

### Minor Changes

- [#789](https://github.com/chakra-ui/zag/pull/789)
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine event handling and rename `PublicApi` to `Api`

### Patch Changes

- [#816](https://github.com/chakra-ui/zag/pull/816)
  [`c1b04e32`](https://github.com/chakra-ui/zag/commit/c1b04e3248a2bf5211c4ee82298bc827521f102d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where select clicks underlying element on mobile.
  - Fix issue where combobox and menu option item triggers double click.

- [#807](https://github.com/chakra-ui/zag/pull/807)
  [`82d1ab7b`](https://github.com/chakra-ui/zag/commit/82d1ab7b61d75fa6d7678e60af53b84c5d93e74b) Thanks
  [@srflp](https://github.com/srflp)! - Re-enable the input after removing `disabled` attribute from the parent fieldset

- Updated dependencies [[`82d1ab7b`](https://github.com/chakra-ui/zag/commit/82d1ab7b61d75fa6d7678e60af53b84c5d93e74b),
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82)]:
  - @zag-js/form-utils@0.17.0
  - @zag-js/dom-query@0.17.0
  - @zag-js/dismissable@0.17.0
  - @zag-js/popper@0.17.0
  - @zag-js/tabbable@0.17.0
  - @zag-js/dom-event@0.17.0
  - @zag-js/anatomy@0.17.0
  - @zag-js/core@0.17.0
  - @zag-js/types@0.17.0
  - @zag-js/utils@0.17.0
  - @zag-js/mutation-observer@0.17.0
  - @zag-js/visually-hidden@0.17.0

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
