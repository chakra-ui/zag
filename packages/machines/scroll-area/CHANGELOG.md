# @zag-js/scroll-area

## 1.22.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.22.1
  - @zag-js/core@1.22.1
  - @zag-js/types@1.22.1
  - @zag-js/utils@1.22.1
  - @zag-js/dom-query@1.22.1

## 1.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.22.0
  - @zag-js/core@1.22.0
  - @zag-js/types@1.22.0
  - @zag-js/utils@1.22.0
  - @zag-js/dom-query@1.22.0

## 1.21.9

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.9
  - @zag-js/core@1.21.9
  - @zag-js/types@1.21.9
  - @zag-js/utils@1.21.9
  - @zag-js/dom-query@1.21.9

## 1.21.8

### Patch Changes

- [#2659](https://github.com/chakra-ui/zag/pull/2659)
  [`a16d148`](https://github.com/chakra-ui/zag/commit/a16d148fa9aab318c1878409f1c1b21334a5e386) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Prevent hover state from clearing when pointer moves into
  descendants or portals by guarding `onPointerLeave` with `contains` from `@zag-js/dom-query`. This avoids unintended
  scrollbar hide/show when interacting with sibling portals.

- [#2652](https://github.com/chakra-ui/zag/pull/2652)
  [`d4bbfb0`](https://github.com/chakra-ui/zag/commit/d4bbfb0a72f48ef736ac012ead64d99dc02b2b15) Thanks
  [@devpla](https://github.com/devpla)! - Add `data-dragging` attribute to scroll area parts for ease of styling.

- Updated dependencies [[`dd1519a`](https://github.com/chakra-ui/zag/commit/dd1519a668f315e2feab7aed51007f3380880229)]:
  - @zag-js/dom-query@1.21.8
  - @zag-js/core@1.21.8
  - @zag-js/anatomy@1.21.8
  - @zag-js/types@1.21.8
  - @zag-js/utils@1.21.8

## 1.21.7

### Patch Changes

- [`49ca977`](https://github.com/chakra-ui/zag/commit/49ca977985566adeb4d9e5932c48893b87155463) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-hover` to scroll area

- Updated dependencies []:
  - @zag-js/anatomy@1.21.7
  - @zag-js/core@1.21.7
  - @zag-js/types@1.21.7
  - @zag-js/utils@1.21.7
  - @zag-js/dom-query@1.21.7

## 1.21.6

### Patch Changes

- [`47acc94`](https://github.com/chakra-ui/zag/commit/47acc94dcf21b6f21e183abbc86d8fc4880dbf39) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `data-hovering` to `data-hover` for consistency

- Updated dependencies []:
  - @zag-js/anatomy@1.21.6
  - @zag-js/core@1.21.6
  - @zag-js/types@1.21.6
  - @zag-js/utils@1.21.6
  - @zag-js/dom-query@1.21.6

## 1.21.5

### Patch Changes

- [`32f7259`](https://github.com/chakra-ui/zag/commit/32f72590c3d6cac1a50d8d0a88e6b647509c1f2c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where scroll area thumb applies width/height
  incorrectly
  - Add `data-overflow-*` to content and corner
  - Add custom easing function support for smooth scrolling
- Updated dependencies []:
  - @zag-js/anatomy@1.21.5
  - @zag-js/core@1.21.5
  - @zag-js/types@1.21.5
  - @zag-js/utils@1.21.5
  - @zag-js/dom-query@1.21.5

## 1.21.4

### Patch Changes

- [`341fec8`](https://github.com/chakra-ui/zag/commit/341fec808433943e2e66fba7bd627cdac8578f2c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Ensure types are exported and fix incorrect
  `@zag-js/dom-query/src/query` import

- Updated dependencies []:
  - @zag-js/anatomy@1.21.4
  - @zag-js/core@1.21.4
  - @zag-js/types@1.21.4
  - @zag-js/utils@1.21.4
  - @zag-js/dom-query@1.21.4

## 1.21.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.3
  - @zag-js/core@1.21.3
  - @zag-js/types@1.21.3
  - @zag-js/utils@1.21.3
  - @zag-js/dom-query@1.21.3

## 1.21.2

### Patch Changes

- [#2619](https://github.com/chakra-ui/zag/pull/2619)
  [`d9dac88`](https://github.com/chakra-ui/zag/commit/d9dac88772ca5fc7db2b7a3c00e9e789957e9d67) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release of scroll area state machine

- Updated dependencies []:
  - @zag-js/anatomy@1.21.2
  - @zag-js/core@1.21.2
  - @zag-js/types@1.21.2
  - @zag-js/utils@1.21.2
  - @zag-js/dom-query@1.21.2
