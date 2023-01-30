# @zag-js/hover-card

## 0.2.1

### Patch Changes

- Updated dependencies [[`80de0b7c`](https://github.com/chakra-ui/zag/commit/80de0b7c7f888a254a3e1fec2da5338e235bc699)]:
  - @zag-js/core@0.2.6

## 0.2.0

### Minor Changes

- [#472](https://github.com/chakra-ui/zag/pull/472)
  [`ccd562f3`](https://github.com/chakra-ui/zag/commit/ccd562f3ba7b4e3b3209274dd452a471592aef1b) Thanks
  [@TimKolberger](https://github.com/TimKolberger)! - Add `open` and `close` functions to the connect api:

  ```ts
  import * as hoverCard from "@zag-js/hover-card"

  const api = hoverCard.connect(state, send, normalizeProps)

  // call `open` to open the hover card
  api.open()

  // call `close` to close the hover card
  api.close()
  ```

### Patch Changes

- Updated dependencies [[`c1f609df`](https://github.com/chakra-ui/zag/commit/c1f609dfabbc31c296ebdc1e89480313130f832b),
  [`c7e85e20`](https://github.com/chakra-ui/zag/commit/c7e85e20d4d08b56852768becf2fc5f7f4275dcc)]:
  - @zag-js/types@0.3.3
  - @zag-js/core@0.2.5
  - @zag-js/dismissable@0.2.1
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
  - @zag-js/dismissable@0.2.1
  - @zag-js/popper@0.2.2

## 0.1.5

### Patch Changes

- Updated dependencies [[`5bd24f02`](https://github.com/chakra-ui/zag/commit/5bd24f02fcab355f7df8a2d5cea3b155155380f8)]:
  - @zag-js/anatomy@0.1.2

## 0.1.4

### Patch Changes

- [`af4ab9bb`](https://github.com/chakra-ui/zag/commit/af4ab9bb7cd599c53e47ca7ed2ea90a4ff742499) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update anatomy of components

- Updated dependencies [[`9d936614`](https://github.com/chakra-ui/zag/commit/9d93661439f10a550c154e9f290905d32e8f509b),
  [`9332f1ca`](https://github.com/chakra-ui/zag/commit/9332f1caf5122c16a3edb48e20664b04714d226c)]:
  - @zag-js/core@0.2.3
  - @zag-js/popper@0.2.1

## 0.1.3

### Patch Changes

- [#416](https://github.com/chakra-ui/zag/pull/416)
  [`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Describe the anatomy of a machine and use it to generate data-scope
  and data-part

- Updated dependencies [[`5e0e0ff5`](https://github.com/chakra-ui/zag/commit/5e0e0ff57c15c173bbf5f38e4e0dac117b47739b)]:
  - @zag-js/anatomy@0.1.1

## 0.1.2

### Patch Changes

- Updated dependencies [[`44feef0b`](https://github.com/chakra-ui/zag/commit/44feef0bdf312e27d6faf1aa8ab0ecff0281108c),
  [`810e7d85`](https://github.com/chakra-ui/zag/commit/810e7d85274a26e0fe76dbdb2829fd7ab7f982a6),
  [`e328b306`](https://github.com/chakra-ui/zag/commit/e328b306bf06d151fff4907a7e8e1160f07af855),
  [`65976dd5`](https://github.com/chakra-ui/zag/commit/65976dd51902b1c4a4460cd196467156a705a999)]:
  - @zag-js/core@0.2.2
  - @zag-js/types@0.3.1
  - @zag-js/dismissable@0.2.0
  - @zag-js/popper@0.2.0

## 0.1.1

### Patch Changes

- [#381](https://github.com/chakra-ui/zag/pull/381)
  [`21775db5`](https://github.com/chakra-ui/zag/commit/21775db5ac318b095f603e7030ec7645e104f663) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Omit undefined values passed in machine's context

- Updated dependencies [[`4aa6955f`](https://github.com/chakra-ui/zag/commit/4aa6955fab7ff6fee8545dcf491576640c69c64e)]:
  - @zag-js/core@0.2.1
  - @zag-js/dismissable@0.2.0
  - @zag-js/popper@0.2.0

## 0.1.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

### Patch Changes

- Updated dependencies [[`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca),
  [`f70dd580`](https://github.com/chakra-ui/zag/commit/f70dd5808ab576d33649e4497e0553c9eef12868)]:
  - @zag-js/core@0.2.0
  - @zag-js/types@0.3.0
  - @zag-js/dismissable@0.2.0
  - @zag-js/popper@0.2.0

## 0.0.3

### Patch Changes

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

- Updated dependencies [[`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7)]:
  - @zag-js/core@0.1.12
  - @zag-js/types@0.2.7
  - @zag-js/dismissable@0.1.6
  - @zag-js/popper@0.1.13

## 0.0.2

### Patch Changes

- [#325](https://github.com/chakra-ui/zag/pull/325)
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Switch packages to use ESM and `type=module`

- Updated dependencies [[`61c11646`](https://github.com/chakra-ui/zag/commit/61c116467c1758bdda7efe1f27d4ed26e7d44624),
  [`c0cc303e`](https://github.com/chakra-ui/zag/commit/c0cc303e9824ea395c06d9faa699d23e19ef6538)]:
  - @zag-js/core@0.1.11
  - @zag-js/types@0.2.6
  - @zag-js/dismissable@0.1.5
  - @zag-js/popper@0.1.12

## 0.0.1

### Patch Changes

- [#315](https://github.com/chakra-ui/zag/pull/315)
  [`5e981508`](https://github.com/chakra-ui/zag/commit/5e981508bbd262cbbfd8289900ec4e999c3d480e) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix anatomy ids

- [#316](https://github.com/chakra-ui/zag/pull/316)
  [`afd9e8a2`](https://github.com/chakra-ui/zag/commit/afd9e8a23d38209f52ddee829dc510beef992dc8) Thanks
  [@anubra266](https://github.com/anubra266)! - Fix issue where hover card gets closed after trigger loses focus while
  pointer is over it, if opened by focus.

- [#304](https://github.com/chakra-ui/zag/pull/304)
  [`370e7e03`](https://github.com/chakra-ui/zag/commit/370e7e035de37a3f023e6f36ff752a48a6532da4) Thanks
  [@anubra266](https://github.com/anubra266)! - Initial release
