# @zag-js/toggle-group

## 0.23.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.23.0
  - @zag-js/core@0.23.0
  - @zag-js/types@0.23.0
  - @zag-js/utils@0.23.0
  - @zag-js/dom-event@0.23.0
  - @zag-js/dom-query@0.23.0

## 0.22.0

### Patch Changes

- [`1bb4e09b`](https://github.com/chakra-ui/zag/commit/1bb4e09b51df47b81fa90a31f3da62a528f985a2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose missing types

- Updated dependencies []:
  - @zag-js/anatomy@0.22.0
  - @zag-js/core@0.22.0
  - @zag-js/types@0.22.0
  - @zag-js/utils@0.22.0
  - @zag-js/dom-event@0.22.0
  - @zag-js/dom-query@0.22.0

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

- [`01f1e200`](https://github.com/chakra-ui/zag/commit/01f1e200eba7631d3508f1360d6c9d941430557b) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Export toggle group anatomy

- Updated dependencies []:
  - @zag-js/anatomy@0.21.0
  - @zag-js/core@0.21.0
  - @zag-js/types@0.21.0
  - @zag-js/utils@0.21.0
  - @zag-js/dom-event@0.21.0
  - @zag-js/dom-query@0.21.0

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
  - @zag-js/utils@0.20.0
  - @zag-js/dom-event@0.20.0
  - @zag-js/dom-query@0.20.0

## 0.19.1

### Patch Changes

- [`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where change callbacks could be executed excessively
  when no value changed.

- Updated dependencies [[`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016),
  [`3f0b6a19`](https://github.com/chakra-ui/zag/commit/3f0b6a19dcf9779846efb2bc093235299301bbdb)]:
  - @zag-js/utils@0.19.1
  - @zag-js/core@0.19.1
  - @zag-js/anatomy@0.19.1
  - @zag-js/types@0.19.1
  - @zag-js/dom-event@0.19.1
  - @zag-js/dom-query@0.19.1

## 0.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.19.0
  - @zag-js/core@0.19.0
  - @zag-js/types@0.19.0
  - @zag-js/utils@0.19.0
  - @zag-js/dom-event@0.19.0
  - @zag-js/dom-query@0.19.0

## 0.18.0

### Patch Changes

- Updated dependencies [[`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa)]:
  - @zag-js/utils@0.18.0
  - @zag-js/core@0.18.0
  - @zag-js/anatomy@0.18.0
  - @zag-js/types@0.18.0
  - @zag-js/dom-event@0.18.0
  - @zag-js/dom-query@0.18.0

## 0.17.0

### Minor Changes

- [#789](https://github.com/chakra-ui/zag/pull/789)
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine event handling and rename `PublicApi` to `Api`

### Patch Changes

- Updated dependencies [[`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82)]:
  - @zag-js/dom-query@0.17.0
  - @zag-js/dom-event@0.17.0
  - @zag-js/anatomy@0.17.0
  - @zag-js/core@0.17.0
  - @zag-js/types@0.17.0
  - @zag-js/utils@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dom-event@0.16.0
  - @zag-js/dom-query@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.15.0
  - @zag-js/core@0.15.0
  - @zag-js/types@0.15.0
  - @zag-js/utils@0.15.0
  - @zag-js/dom-event@0.15.0
  - @zag-js/dom-query@0.15.0

## 0.14.0

### Patch Changes

- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/dom-event@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/utils@0.14.0

## 0.13.0

### Minor Changes

- [`f66ce206`](https://github.com/chakra-ui/zag/commit/f66ce206bcaa1b4ac6a5ddb97f425489ea1508a8) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Initial release

### Patch Changes

- Updated dependencies [[`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414)]:
  - @zag-js/core@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dom-event@0.13.0
  - @zag-js/dom-query@0.13.0
