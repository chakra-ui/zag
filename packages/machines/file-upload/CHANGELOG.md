# @zag-js/file-upload

## 1.26.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.3
  - @zag-js/core@1.26.3
  - @zag-js/types@1.26.3
  - @zag-js/utils@1.26.3
  - @zag-js/dom-query@1.26.3
  - @zag-js/file-utils@1.26.3
  - @zag-js/i18n-utils@1.26.3

## 1.26.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.2
  - @zag-js/core@1.26.2
  - @zag-js/types@1.26.2
  - @zag-js/utils@1.26.2
  - @zag-js/dom-query@1.26.2
  - @zag-js/file-utils@1.26.2
  - @zag-js/i18n-utils@1.26.2

## 1.26.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.1
  - @zag-js/core@1.26.1
  - @zag-js/types@1.26.1
  - @zag-js/utils@1.26.1
  - @zag-js/dom-query@1.26.1
  - @zag-js/file-utils@1.26.1
  - @zag-js/i18n-utils@1.26.1

## 1.26.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.0
  - @zag-js/core@1.26.0
  - @zag-js/types@1.26.0
  - @zag-js/utils@1.26.0
  - @zag-js/dom-query@1.26.0
  - @zag-js/file-utils@1.26.0
  - @zag-js/i18n-utils@1.26.0

## 1.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.25.0
  - @zag-js/core@1.25.0
  - @zag-js/types@1.25.0
  - @zag-js/utils@1.25.0
  - @zag-js/dom-query@1.25.0
  - @zag-js/file-utils@1.25.0
  - @zag-js/i18n-utils@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies [[`55197c8`](https://github.com/chakra-ui/zag/commit/55197c89fa86daa10c8ac0a7f2f4726c88584211)]:
  - @zag-js/i18n-utils@1.24.2
  - @zag-js/file-utils@1.24.2
  - @zag-js/anatomy@1.24.2
  - @zag-js/core@1.24.2
  - @zag-js/types@1.24.2
  - @zag-js/utils@1.24.2
  - @zag-js/dom-query@1.24.2

## 1.24.1

### Patch Changes

- Updated dependencies [[`ab0d4f7`](https://github.com/chakra-ui/zag/commit/ab0d4f73d6ca0571cb09ebad5bf724fe81e94ef8)]:
  - @zag-js/core@1.24.1
  - @zag-js/anatomy@1.24.1
  - @zag-js/types@1.24.1
  - @zag-js/utils@1.24.1
  - @zag-js/dom-query@1.24.1
  - @zag-js/file-utils@1.24.1
  - @zag-js/i18n-utils@1.24.1

## 1.24.0

### Patch Changes

- [`851bae8`](https://github.com/chakra-ui/zag/commit/851bae81cde30b106fb4cbfac4c22281097aa715) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix regression where clicking the trigger doesn't open the file
  picker when used within the dropzone

- Updated dependencies []:
  - @zag-js/anatomy@1.24.0
  - @zag-js/core@1.24.0
  - @zag-js/types@1.24.0
  - @zag-js/utils@1.24.0
  - @zag-js/dom-query@1.24.0
  - @zag-js/file-utils@1.24.0
  - @zag-js/i18n-utils@1.24.0

## 1.23.0

### Minor Changes

- [`2def7af`](https://github.com/chakra-ui/zag/commit/2def7afac7a7ed3815c688eb9de56000e2ce845c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Resolved an issue where `onFileReject` was incorrectly triggered
  when deleting accepted files using `ItemDeleteTrigger`
  - The file deletion logic now properly differentiates between accepted and rejected files, preventing unnecessary
    callbacks
  - Added `type` prop to all item-related components (`ItemProps`, `ItemGroupProps`) to specify whether items are
    "accepted" or "rejected"
  - Added `data-type` attribute to all item-related elements for easier styling of accepted vs rejected files
  - Exposed `ItemType`, `ItemGroupProps`, and `ItemTypeProps` types for better TypeScript support

  ### Migration

  When rendering rejected files, you should now pass `type: "rejected"` to item components:

  ```tsx
  // Before
  <div {...api.getItemProps({ file })}>
    <button {...api.getItemDeleteTriggerProps({ file })}>Delete</button>
  </div>

  // After - for rejected files
  <div {...api.getItemProps({ file, type: "rejected" })}>
    <button {...api.getItemDeleteTriggerProps({ file, type: "rejected" })}>Delete</button>
  </div>
  ```

### Patch Changes

- [#2673](https://github.com/chakra-ui/zag/pull/2673)
  [`a493193`](https://github.com/chakra-ui/zag/commit/a493193dd55524e14800bfc449ca137be7f633aa) Thanks
  [@julienbenac](https://github.com/julienbenac)! - Add `data-required` to label parts

- Updated dependencies [[`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac),
  [`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/dom-query@1.23.0
  - @zag-js/core@1.23.0
  - @zag-js/i18n-utils@1.23.0
  - @zag-js/file-utils@1.23.0
  - @zag-js/anatomy@1.23.0
  - @zag-js/types@1.23.0
  - @zag-js/utils@1.23.0

## 1.22.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.22.1
  - @zag-js/core@1.22.1
  - @zag-js/types@1.22.1
  - @zag-js/utils@1.22.1
  - @zag-js/dom-query@1.22.1
  - @zag-js/file-utils@1.22.1
  - @zag-js/i18n-utils@1.22.1

## 1.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.22.0
  - @zag-js/core@1.22.0
  - @zag-js/types@1.22.0
  - @zag-js/utils@1.22.0
  - @zag-js/dom-query@1.22.0
  - @zag-js/file-utils@1.22.0
  - @zag-js/i18n-utils@1.22.0

## 1.21.9

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.9
  - @zag-js/core@1.21.9
  - @zag-js/types@1.21.9
  - @zag-js/utils@1.21.9
  - @zag-js/dom-query@1.21.9
  - @zag-js/file-utils@1.21.9
  - @zag-js/i18n-utils@1.21.9

## 1.21.8

### Patch Changes

- Updated dependencies [[`dd1519a`](https://github.com/chakra-ui/zag/commit/dd1519a668f315e2feab7aed51007f3380880229)]:
  - @zag-js/dom-query@1.21.8
  - @zag-js/core@1.21.8
  - @zag-js/i18n-utils@1.21.8
  - @zag-js/file-utils@1.21.8
  - @zag-js/anatomy@1.21.8
  - @zag-js/types@1.21.8
  - @zag-js/utils@1.21.8

## 1.21.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.7
  - @zag-js/core@1.21.7
  - @zag-js/types@1.21.7
  - @zag-js/utils@1.21.7
  - @zag-js/dom-query@1.21.7
  - @zag-js/file-utils@1.21.7
  - @zag-js/i18n-utils@1.21.7

## 1.21.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.6
  - @zag-js/core@1.21.6
  - @zag-js/types@1.21.6
  - @zag-js/utils@1.21.6
  - @zag-js/dom-query@1.21.6
  - @zag-js/file-utils@1.21.6
  - @zag-js/i18n-utils@1.21.6

## 1.21.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.5
  - @zag-js/core@1.21.5
  - @zag-js/types@1.21.5
  - @zag-js/utils@1.21.5
  - @zag-js/dom-query@1.21.5
  - @zag-js/file-utils@1.21.5
  - @zag-js/i18n-utils@1.21.5

## 1.21.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.4
  - @zag-js/core@1.21.4
  - @zag-js/types@1.21.4
  - @zag-js/utils@1.21.4
  - @zag-js/dom-query@1.21.4
  - @zag-js/file-utils@1.21.4
  - @zag-js/i18n-utils@1.21.4

## 1.21.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.3
  - @zag-js/core@1.21.3
  - @zag-js/types@1.21.3
  - @zag-js/utils@1.21.3
  - @zag-js/dom-query@1.21.3
  - @zag-js/file-utils@1.21.3
  - @zag-js/i18n-utils@1.21.3

## 1.21.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.2
  - @zag-js/core@1.21.2
  - @zag-js/types@1.21.2
  - @zag-js/utils@1.21.2
  - @zag-js/dom-query@1.21.2
  - @zag-js/file-utils@1.21.2
  - @zag-js/i18n-utils@1.21.2

## 1.21.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.1
  - @zag-js/core@1.21.1
  - @zag-js/types@1.21.1
  - @zag-js/utils@1.21.1
  - @zag-js/dom-query@1.21.1
  - @zag-js/file-utils@1.21.1
  - @zag-js/i18n-utils@1.21.1

## 1.21.0

### Minor Changes

- [`aca32e9`](https://github.com/chakra-ui/zag/commit/aca32e9a7339ac5a273e610b9dd898b447edca71) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `api.transforming` to track file transformation state when
  using `transformFiles`. This enables developers to show loading states during file processing.

  ```tsx
  const service = useMachine(fileUpload.machine, {
    // 1. Define a function to transform the files
    transformFiles: async (files) => {
      return files.map((file) => {
        return new File([file], file.name, { type: file.type })
      })
    },
  })

  // 2. Connect the service to the component
  const api = fileUpload.connect(service, normalizeProps)

  // 3. Show loading indicator when files are being transformed
  if (api.transforming) {
    return <div>Transforming files...</div>
  }
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.0
  - @zag-js/core@1.21.0
  - @zag-js/types@1.21.0
  - @zag-js/utils@1.21.0
  - @zag-js/dom-query@1.21.0
  - @zag-js/file-utils@1.21.0
  - @zag-js/i18n-utils@1.21.0

## 1.20.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.1
  - @zag-js/core@1.20.1
  - @zag-js/types@1.20.1
  - @zag-js/utils@1.20.1
  - @zag-js/dom-query@1.20.1
  - @zag-js/file-utils@1.20.1
  - @zag-js/i18n-utils@1.20.1

## 1.20.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.0
  - @zag-js/core@1.20.0
  - @zag-js/types@1.20.0
  - @zag-js/utils@1.20.0
  - @zag-js/dom-query@1.20.0
  - @zag-js/file-utils@1.20.0
  - @zag-js/i18n-utils@1.20.0

## 1.19.0

### Minor Changes

- [`6332081`](https://github.com/chakra-ui/zag/commit/633208183516e272d74cbfdc2c94547b0c4f3218) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for programmatically controlling the accepted files
  via `acceptedFiles` and `defaultAcceptedFiles`

  ```tsx
  const service = useMachine(fileUpload.machine, {
    defaultAcceptedFiles: [new File(["test"], "test.txt", { type: "text/plain" })],
  })
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.19.0
  - @zag-js/core@1.19.0
  - @zag-js/types@1.19.0
  - @zag-js/utils@1.19.0
  - @zag-js/dom-query@1.19.0
  - @zag-js/file-utils@1.19.0
  - @zag-js/i18n-utils@1.19.0

## 1.18.5

### Patch Changes

- [`59a7bfb`](https://github.com/chakra-ui/zag/commit/59a7bfb7215b4c9d13d11487f50ad852cd8347a9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue destructuring returned api could throw an ESLint
  `unbound-method` warning

- Updated dependencies []:
  - @zag-js/anatomy@1.18.5
  - @zag-js/core@1.18.5
  - @zag-js/types@1.18.5
  - @zag-js/utils@1.18.5
  - @zag-js/dom-query@1.18.5
  - @zag-js/file-utils@1.18.5
  - @zag-js/i18n-utils@1.18.5

## 1.18.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.4
  - @zag-js/core@1.18.4
  - @zag-js/types@1.18.4
  - @zag-js/utils@1.18.4
  - @zag-js/dom-query@1.18.4
  - @zag-js/file-utils@1.18.4
  - @zag-js/i18n-utils@1.18.4

## 1.18.3

### Patch Changes

- [`55aa5d8`](https://github.com/chakra-ui/zag/commit/55aa5d8511a01e5203f5a0562e53bf26d7807e0c) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where calling `api.setFiles` invokes validation with
  incorrect `acceptedFiles`

- Updated dependencies [[`09b1292`](https://github.com/chakra-ui/zag/commit/09b12921e7165392ce9efa0d9dab1b4cdae6835c)]:
  - @zag-js/file-utils@1.18.3
  - @zag-js/anatomy@1.18.3
  - @zag-js/core@1.18.3
  - @zag-js/types@1.18.3
  - @zag-js/utils@1.18.3
  - @zag-js/dom-query@1.18.3
  - @zag-js/i18n-utils@1.18.3

## 1.18.2

### Patch Changes

- Updated dependencies [[`11843e6`](https://github.com/chakra-ui/zag/commit/11843e6adf62b906006890c8003b38da2850c8ee)]:
  - @zag-js/utils@1.18.2
  - @zag-js/core@1.18.2
  - @zag-js/anatomy@1.18.2
  - @zag-js/types@1.18.2
  - @zag-js/dom-query@1.18.2
  - @zag-js/file-utils@1.18.2
  - @zag-js/i18n-utils@1.18.2

## 1.18.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.1
  - @zag-js/core@1.18.1
  - @zag-js/types@1.18.1
  - @zag-js/utils@1.18.1
  - @zag-js/dom-query@1.18.1
  - @zag-js/file-utils@1.18.1
  - @zag-js/i18n-utils@1.18.1

## 1.18.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.0
  - @zag-js/core@1.18.0
  - @zag-js/types@1.18.0
  - @zag-js/utils@1.18.0
  - @zag-js/dom-query@1.18.0
  - @zag-js/file-utils@1.18.0
  - @zag-js/i18n-utils@1.18.0

## 1.17.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.4
  - @zag-js/core@1.17.4
  - @zag-js/types@1.17.4
  - @zag-js/utils@1.17.4
  - @zag-js/dom-query@1.17.4
  - @zag-js/file-utils@1.17.4
  - @zag-js/i18n-utils@1.17.4

## 1.17.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.3
  - @zag-js/core@1.17.3
  - @zag-js/types@1.17.3
  - @zag-js/utils@1.17.3
  - @zag-js/dom-query@1.17.3
  - @zag-js/file-utils@1.17.3
  - @zag-js/i18n-utils@1.17.3

## 1.17.2

### Patch Changes

- Updated dependencies [[`e5fc0cd`](https://github.com/chakra-ui/zag/commit/e5fc0cde746e8baeb400f2b18acc5829941f4862)]:
  - @zag-js/i18n-utils@1.17.2
  - @zag-js/file-utils@1.17.2
  - @zag-js/anatomy@1.17.2
  - @zag-js/core@1.17.2
  - @zag-js/types@1.17.2
  - @zag-js/utils@1.17.2
  - @zag-js/dom-query@1.17.2

## 1.17.1

### Patch Changes

- Updated dependencies [[`4b6302f`](https://github.com/chakra-ui/zag/commit/4b6302fc9104f1ae8cd89a0f0157884fb775a65a)]:
  - @zag-js/anatomy@1.17.1
  - @zag-js/core@1.17.1
  - @zag-js/types@1.17.1
  - @zag-js/utils@1.17.1
  - @zag-js/dom-query@1.17.1
  - @zag-js/file-utils@1.17.1
  - @zag-js/i18n-utils@1.17.1

## 1.17.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.0
  - @zag-js/core@1.17.0
  - @zag-js/types@1.17.0
  - @zag-js/utils@1.17.0
  - @zag-js/dom-query@1.17.0
  - @zag-js/file-utils@1.17.0
  - @zag-js/i18n-utils@1.17.0

## 1.16.0

### Patch Changes

- Updated dependencies [[`6f6c8f3`](https://github.com/chakra-ui/zag/commit/6f6c8f329d9eb9d9889eff4317c84a4f41d4bfb2)]:
  - @zag-js/types@1.16.0
  - @zag-js/dom-query@1.16.0
  - @zag-js/core@1.16.0
  - @zag-js/i18n-utils@1.16.0
  - @zag-js/file-utils@1.16.0
  - @zag-js/anatomy@1.16.0
  - @zag-js/utils@1.16.0

## 1.15.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.7
  - @zag-js/core@1.15.7
  - @zag-js/types@1.15.7
  - @zag-js/utils@1.15.7
  - @zag-js/dom-query@1.15.7
  - @zag-js/file-utils@1.15.7
  - @zag-js/i18n-utils@1.15.7

## 1.15.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.6
  - @zag-js/core@1.15.6
  - @zag-js/types@1.15.6
  - @zag-js/utils@1.15.6
  - @zag-js/dom-query@1.15.6
  - @zag-js/file-utils@1.15.6
  - @zag-js/i18n-utils@1.15.6

## 1.15.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.5
  - @zag-js/core@1.15.5
  - @zag-js/types@1.15.5
  - @zag-js/utils@1.15.5
  - @zag-js/dom-query@1.15.5
  - @zag-js/file-utils@1.15.5
  - @zag-js/i18n-utils@1.15.5

## 1.15.4

### Patch Changes

- Updated dependencies [[`e5f698d`](https://github.com/chakra-ui/zag/commit/e5f698d082ea8ae7f9f45958c4e319de7c7b6107)]:
  - @zag-js/dom-query@1.15.4
  - @zag-js/core@1.15.4
  - @zag-js/i18n-utils@1.15.4
  - @zag-js/file-utils@1.15.4
  - @zag-js/anatomy@1.15.4
  - @zag-js/types@1.15.4
  - @zag-js/utils@1.15.4

## 1.15.3

### Patch Changes

- Updated dependencies [[`ff4c244`](https://github.com/chakra-ui/zag/commit/ff4c244549019680ada2afc073102c523a428524)]:
  - @zag-js/file-utils@1.15.3
  - @zag-js/anatomy@1.15.3
  - @zag-js/core@1.15.3
  - @zag-js/types@1.15.3
  - @zag-js/utils@1.15.3
  - @zag-js/dom-query@1.15.3
  - @zag-js/i18n-utils@1.15.3

## 1.15.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.2
  - @zag-js/core@1.15.2
  - @zag-js/types@1.15.2
  - @zag-js/utils@1.15.2
  - @zag-js/dom-query@1.15.2
  - @zag-js/file-utils@1.15.2
  - @zag-js/i18n-utils@1.15.2

## 1.15.1

### Patch Changes

- [#2514](https://github.com/chakra-ui/zag/pull/2514)
  [`f272a23`](https://github.com/chakra-ui/zag/commit/f272a235e08a7eebff476e557f42443765057b6c) Thanks
  [@ichizero](https://github.com/ichizero)! - Prevent `undefined` in `acceptedFiles` when no files accepted

- Updated dependencies []:
  - @zag-js/anatomy@1.15.1
  - @zag-js/core@1.15.1
  - @zag-js/types@1.15.1
  - @zag-js/utils@1.15.1
  - @zag-js/dom-query@1.15.1
  - @zag-js/file-utils@1.15.1
  - @zag-js/i18n-utils@1.15.1

## 1.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.0
  - @zag-js/core@1.15.0
  - @zag-js/types@1.15.0
  - @zag-js/utils@1.15.0
  - @zag-js/dom-query@1.15.0
  - @zag-js/file-utils@1.15.0
  - @zag-js/i18n-utils@1.15.0

## 1.14.0

### Minor Changes

- [`7976c82`](https://github.com/chakra-ui/zag/commit/7976c82deb7ceb5c361d7ddc085c750b74fe86ce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for transforming uploaded files via `transformFiles`
  context property.

  ```tsx
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    accept: ["image/jpeg", "image/png"],
    transformFiles: async (files) => {
      return Promise.all(files.map((file) => compress(file, { size: 200 })))
    },
  })
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.14.0
  - @zag-js/core@1.14.0
  - @zag-js/types@1.14.0
  - @zag-js/utils@1.14.0
  - @zag-js/dom-query@1.14.0
  - @zag-js/file-utils@1.14.0
  - @zag-js/i18n-utils@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.1
  - @zag-js/core@1.13.1
  - @zag-js/types@1.13.1
  - @zag-js/utils@1.13.1
  - @zag-js/dom-query@1.13.1
  - @zag-js/file-utils@1.13.1
  - @zag-js/i18n-utils@1.13.1

## 1.13.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.0
  - @zag-js/core@1.13.0
  - @zag-js/types@1.13.0
  - @zag-js/utils@1.13.0
  - @zag-js/dom-query@1.13.0
  - @zag-js/file-utils@1.13.0
  - @zag-js/i18n-utils@1.13.0

## 1.12.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.4
  - @zag-js/core@1.12.4
  - @zag-js/types@1.12.4
  - @zag-js/utils@1.12.4
  - @zag-js/dom-query@1.12.4
  - @zag-js/file-utils@1.12.4
  - @zag-js/i18n-utils@1.12.4

## 1.12.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.3
  - @zag-js/core@1.12.3
  - @zag-js/types@1.12.3
  - @zag-js/utils@1.12.3
  - @zag-js/dom-query@1.12.3
  - @zag-js/file-utils@1.12.3
  - @zag-js/i18n-utils@1.12.3

## 1.12.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.2
  - @zag-js/core@1.12.2
  - @zag-js/types@1.12.2
  - @zag-js/utils@1.12.2
  - @zag-js/dom-query@1.12.2
  - @zag-js/file-utils@1.12.2
  - @zag-js/i18n-utils@1.12.2

## 1.12.1

### Patch Changes

- [#2447](https://github.com/chakra-ui/zag/pull/2447)
  [`33b85ed`](https://github.com/chakra-ui/zag/commit/33b85ed5bd9d38ea8953cf983b138d4c944fbb25) Thanks
  [@YusukeSano](https://github.com/YusukeSano)! - Add default `PropTypes` type parameter to `Api` interface

- Updated dependencies []:
  - @zag-js/anatomy@1.12.1
  - @zag-js/core@1.12.1
  - @zag-js/types@1.12.1
  - @zag-js/utils@1.12.1
  - @zag-js/dom-query@1.12.1
  - @zag-js/file-utils@1.12.1
  - @zag-js/i18n-utils@1.12.1

## 1.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.0
  - @zag-js/core@1.12.0
  - @zag-js/types@1.12.0
  - @zag-js/utils@1.12.0
  - @zag-js/dom-query@1.12.0
  - @zag-js/file-utils@1.12.0
  - @zag-js/i18n-utils@1.12.0

## 1.11.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.11.0
  - @zag-js/core@1.11.0
  - @zag-js/types@1.11.0
  - @zag-js/utils@1.11.0
  - @zag-js/dom-query@1.11.0
  - @zag-js/file-utils@1.11.0
  - @zag-js/i18n-utils@1.11.0

## 1.10.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.10.0
  - @zag-js/core@1.10.0
  - @zag-js/types@1.10.0
  - @zag-js/utils@1.10.0
  - @zag-js/dom-query@1.10.0
  - @zag-js/file-utils@1.10.0
  - @zag-js/i18n-utils@1.10.0

## 1.9.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.3
  - @zag-js/core@1.9.3
  - @zag-js/types@1.9.3
  - @zag-js/utils@1.9.3
  - @zag-js/dom-query@1.9.3
  - @zag-js/file-utils@1.9.3
  - @zag-js/i18n-utils@1.9.3

## 1.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.2
  - @zag-js/core@1.9.2
  - @zag-js/types@1.9.2
  - @zag-js/utils@1.9.2
  - @zag-js/dom-query@1.9.2
  - @zag-js/file-utils@1.9.2
  - @zag-js/i18n-utils@1.9.2

## 1.9.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.1
  - @zag-js/core@1.9.1
  - @zag-js/types@1.9.1
  - @zag-js/utils@1.9.1
  - @zag-js/dom-query@1.9.1
  - @zag-js/file-utils@1.9.1
  - @zag-js/i18n-utils@1.9.1

## 1.9.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.0
  - @zag-js/core@1.9.0
  - @zag-js/types@1.9.0
  - @zag-js/utils@1.9.0
  - @zag-js/dom-query@1.9.0
  - @zag-js/file-utils@1.9.0
  - @zag-js/i18n-utils@1.9.0

## 1.8.2

### Patch Changes

- Updated dependencies [[`25d93b8`](https://github.com/chakra-ui/zag/commit/25d93b8be12e8df26ed04c5d298c66f54910fe85)]:
  - @zag-js/dom-query@1.8.2
  - @zag-js/core@1.8.2
  - @zag-js/i18n-utils@1.8.2
  - @zag-js/file-utils@1.8.2
  - @zag-js/anatomy@1.8.2
  - @zag-js/types@1.8.2
  - @zag-js/utils@1.8.2

## 1.8.1

### Patch Changes

- Updated dependencies [[`c3c1642`](https://github.com/chakra-ui/zag/commit/c3c164296cd643f2fb7c12c0d1fe9c406eba352f)]:
  - @zag-js/dom-query@1.8.1
  - @zag-js/core@1.8.1
  - @zag-js/i18n-utils@1.8.1
  - @zag-js/file-utils@1.8.1
  - @zag-js/anatomy@1.8.1
  - @zag-js/types@1.8.1
  - @zag-js/utils@1.8.1

## 1.8.0

### Patch Changes

- Updated dependencies [[`66f7828`](https://github.com/chakra-ui/zag/commit/66f7828541102fcf4f0fba05bb241e20a5ed45cb)]:
  - @zag-js/core@1.8.0
  - @zag-js/anatomy@1.8.0
  - @zag-js/types@1.8.0
  - @zag-js/utils@1.8.0
  - @zag-js/dom-query@1.8.0
  - @zag-js/file-utils@1.8.0
  - @zag-js/i18n-utils@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.7.0
  - @zag-js/core@1.7.0
  - @zag-js/types@1.7.0
  - @zag-js/utils@1.7.0
  - @zag-js/dom-query@1.7.0
  - @zag-js/file-utils@1.7.0
  - @zag-js/i18n-utils@1.7.0

## 1.6.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.2
  - @zag-js/core@1.6.2
  - @zag-js/types@1.6.2
  - @zag-js/utils@1.6.2
  - @zag-js/dom-query@1.6.2
  - @zag-js/file-utils@1.6.2
  - @zag-js/i18n-utils@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.1
  - @zag-js/core@1.6.1
  - @zag-js/types@1.6.1
  - @zag-js/utils@1.6.1
  - @zag-js/dom-query@1.6.1
  - @zag-js/file-utils@1.6.1
  - @zag-js/i18n-utils@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.0
  - @zag-js/core@1.6.0
  - @zag-js/types@1.6.0
  - @zag-js/utils@1.6.0
  - @zag-js/dom-query@1.6.0
  - @zag-js/file-utils@1.6.0
  - @zag-js/i18n-utils@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies [[`5db0d3f`](https://github.com/chakra-ui/zag/commit/5db0d3fc1827b8e6000c156466d40d3d66a44e21)]:
  - @zag-js/file-utils@1.5.0
  - @zag-js/anatomy@1.5.0
  - @zag-js/core@1.5.0
  - @zag-js/types@1.5.0
  - @zag-js/utils@1.5.0
  - @zag-js/dom-query@1.5.0
  - @zag-js/i18n-utils@1.5.0

## 1.4.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.2
  - @zag-js/core@1.4.2
  - @zag-js/types@1.4.2
  - @zag-js/utils@1.4.2
  - @zag-js/dom-query@1.4.2
  - @zag-js/file-utils@1.4.2
  - @zag-js/i18n-utils@1.4.2

## 1.4.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.1
  - @zag-js/core@1.4.1
  - @zag-js/types@1.4.1
  - @zag-js/utils@1.4.1
  - @zag-js/dom-query@1.4.1
  - @zag-js/file-utils@1.4.1
  - @zag-js/i18n-utils@1.4.1

## 1.4.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.0
  - @zag-js/core@1.4.0
  - @zag-js/types@1.4.0
  - @zag-js/utils@1.4.0
  - @zag-js/dom-query@1.4.0
  - @zag-js/file-utils@1.4.0
  - @zag-js/i18n-utils@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`66ba41b`](https://github.com/chakra-ui/zag/commit/66ba41bb10b232ff08e3cfbfc6cbf2a1c7449e21)]:
  - @zag-js/utils@1.3.3
  - @zag-js/core@1.3.3
  - @zag-js/anatomy@1.3.3
  - @zag-js/types@1.3.3
  - @zag-js/dom-query@1.3.3
  - @zag-js/file-utils@1.3.3
  - @zag-js/i18n-utils@1.3.3

## 1.3.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.2
  - @zag-js/core@1.3.2
  - @zag-js/types@1.3.2
  - @zag-js/utils@1.3.2
  - @zag-js/dom-query@1.3.2
  - @zag-js/file-utils@1.3.2
  - @zag-js/i18n-utils@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.1
  - @zag-js/core@1.3.1
  - @zag-js/types@1.3.1
  - @zag-js/utils@1.3.1
  - @zag-js/dom-query@1.3.1
  - @zag-js/file-utils@1.3.1
  - @zag-js/i18n-utils@1.3.1

## 1.3.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.0
  - @zag-js/core@1.3.0
  - @zag-js/types@1.3.0
  - @zag-js/utils@1.3.0
  - @zag-js/dom-query@1.3.0
  - @zag-js/file-utils@1.3.0
  - @zag-js/i18n-utils@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.1
  - @zag-js/core@1.2.1
  - @zag-js/types@1.2.1
  - @zag-js/utils@1.2.1
  - @zag-js/dom-query@1.2.1
  - @zag-js/file-utils@1.2.1
  - @zag-js/i18n-utils@1.2.1

## 1.2.0

### Patch Changes

- [`d598cce`](https://github.com/chakra-ui/zag/commit/d598cce3e8b1bffa4c6f351c5a351bf703f80168) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `win.DataTransfer` could throw in testing
  environments

- Updated dependencies []:
  - @zag-js/anatomy@1.2.0
  - @zag-js/core@1.2.0
  - @zag-js/types@1.2.0
  - @zag-js/utils@1.2.0
  - @zag-js/dom-query@1.2.0
  - @zag-js/file-utils@1.2.0
  - @zag-js/i18n-utils@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.1.0
  - @zag-js/core@1.1.0
  - @zag-js/types@1.1.0
  - @zag-js/utils@1.1.0
  - @zag-js/dom-query@1.1.0
  - @zag-js/file-utils@1.1.0
  - @zag-js/i18n-utils@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.0.2
  - @zag-js/core@1.0.2
  - @zag-js/types@1.0.2
  - @zag-js/utils@1.0.2
  - @zag-js/dom-query@1.0.2
  - @zag-js/file-utils@1.0.2
  - @zag-js/i18n-utils@1.0.2

## 1.0.1

### Patch Changes

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
  - @zag-js/utils@1.0.1
  - @zag-js/dom-query@1.0.1
  - @zag-js/file-utils@1.0.1
  - @zag-js/i18n-utils@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [[`b1caa44`](https://github.com/chakra-ui/zag/commit/b1caa44085e7f1da0ad24fc7b25178081811646c)]:
  - @zag-js/core@1.0.0
  - @zag-js/anatomy@1.0.0
  - @zag-js/types@1.0.0
  - @zag-js/utils@1.0.0
  - @zag-js/dom-query@1.0.0
  - @zag-js/file-utils@1.0.0
  - @zag-js/i18n-utils@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.2
  - @zag-js/core@0.82.2
  - @zag-js/types@0.82.2
  - @zag-js/utils@0.82.2
  - @zag-js/dom-query@0.82.2
  - @zag-js/file-utils@0.82.2
  - @zag-js/i18n-utils@0.82.2

## 0.82.1

### Patch Changes

- [`a7ea823`](https://github.com/chakra-ui/zag/commit/a7ea82364e7a680bc2fa1ebbe8dd00b98d3debb4) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where multiple files could get added a single upload
  operation.

- Updated dependencies []:
  - @zag-js/anatomy@0.82.1
  - @zag-js/core@0.82.1
  - @zag-js/types@0.82.1
  - @zag-js/utils@0.82.1
  - @zag-js/dom-query@0.82.1
  - @zag-js/file-utils@0.82.1
  - @zag-js/i18n-utils@0.82.1

## 0.82.0

### Patch Changes

- [`b655b4d`](https://github.com/chakra-ui/zag/commit/b655b4de8d6a4762e6bc3a4ae1f68fa65098dff5) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where change event is not fired when dropping files
  into the dropzone
  - Fix issue where `api.setClipboardFiles(...)` was still called when file upload is disabled
  - Expose disabled state via `api.disabled`
  - Fix issue where machine transitions to `dragging` when disabled
  - Fix issue where rejected files could not be deleted using the item delete trigger.
- Updated dependencies []:
  - @zag-js/anatomy@0.82.0
  - @zag-js/core@0.82.0
  - @zag-js/types@0.82.0
  - @zag-js/utils@0.82.0
  - @zag-js/dom-query@0.82.0
  - @zag-js/file-utils@0.82.0
  - @zag-js/i18n-utils@0.82.0

## 0.81.2

### Patch Changes

- [`884973b`](https://github.com/chakra-ui/zag/commit/884973b53e16aaa364f466e5f416caa3aa431c65) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Improve click detection for dropzone
  - Add support for `disableClick` prop on dropzone
- Updated dependencies [[`e9313a3`](https://github.com/chakra-ui/zag/commit/e9313a3663285a05c9ac9ac92f1c09fcb27ac818)]:
  - @zag-js/dom-query@0.81.2
  - @zag-js/i18n-utils@0.81.2
  - @zag-js/file-utils@0.81.2
  - @zag-js/anatomy@0.81.2
  - @zag-js/core@0.81.2
  - @zag-js/types@0.81.2
  - @zag-js/utils@0.81.2

## 0.81.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.81.1
  - @zag-js/core@0.81.1
  - @zag-js/types@0.81.1
  - @zag-js/utils@0.81.1
  - @zag-js/dom-query@0.81.1
  - @zag-js/file-utils@0.81.1
  - @zag-js/i18n-utils@0.81.1

## 0.81.0

### Patch Changes

- Updated dependencies [[`792939f`](https://github.com/chakra-ui/zag/commit/792939f9d9eac5a97cc46f1b0ab286666ba1edd8),
  [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68)]:
  - @zag-js/dom-query@0.81.0
  - @zag-js/types@0.81.0
  - @zag-js/i18n-utils@0.81.0
  - @zag-js/file-utils@0.81.0
  - @zag-js/anatomy@0.81.0
  - @zag-js/core@0.81.0
  - @zag-js/utils@0.81.0

## 0.80.0

### Minor Changes

- [`59b04ae`](https://github.com/chakra-ui/zag/commit/59b04ae0a004475524d6936971d0fc99fe5c4dfb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for preventing drop on document when the file upload
  is used. Use the `preventDropOnDocument` context property. Set to `true` by default to prevent drop on document.
  - Add `api.setClipboardFiles` method to set the files from the clipboard data.
  - Fix issue where hidden input isn't synced with the accepted files.

### Patch Changes

- Updated dependencies [[`d7617d1`](https://github.com/chakra-ui/zag/commit/d7617d1d95f93b3557eb88ba879737894da42d51)]:
  - @zag-js/dom-query@0.80.0
  - @zag-js/i18n-utils@0.80.0
  - @zag-js/file-utils@0.80.0
  - @zag-js/anatomy@0.80.0
  - @zag-js/core@0.80.0
  - @zag-js/types@0.80.0
  - @zag-js/utils@0.80.0

## 0.79.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.3
  - @zag-js/core@0.79.3
  - @zag-js/types@0.79.3
  - @zag-js/utils@0.79.3
  - @zag-js/dom-query@0.79.3
  - @zag-js/file-utils@0.79.3
  - @zag-js/i18n-utils@0.79.3

## 0.79.2

### Patch Changes

- Updated dependencies [[`525e645`](https://github.com/chakra-ui/zag/commit/525e645404f56c10919cc9d36279044dff253a08)]:
  - @zag-js/dom-query@0.79.2
  - @zag-js/i18n-utils@0.79.2
  - @zag-js/file-utils@0.79.2
  - @zag-js/anatomy@0.79.2
  - @zag-js/core@0.79.2
  - @zag-js/types@0.79.2
  - @zag-js/utils@0.79.2

## 0.79.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.1
  - @zag-js/core@0.79.1
  - @zag-js/types@0.79.1
  - @zag-js/utils@0.79.1
  - @zag-js/dom-query@0.79.1
  - @zag-js/file-utils@0.79.1
  - @zag-js/i18n-utils@0.79.1

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.0
  - @zag-js/core@0.79.0
  - @zag-js/types@0.79.0
  - @zag-js/utils@0.79.0
  - @zag-js/dom-query@0.79.0
  - @zag-js/file-utils@0.79.0
  - @zag-js/i18n-utils@0.79.0

## 0.78.3

### Patch Changes

- [#2108](https://github.com/chakra-ui/zag/pull/2108)
  [`64b7d50`](https://github.com/chakra-ui/zag/commit/64b7d50f2149889a17945e309d5f1ca7236bd9b8) Thanks
  [@Adebesin-Cell](https://github.com/Adebesin-Cell)! - fix: ensure accept attribute is applied to file upload input

- Updated dependencies [[`5584a83`](https://github.com/chakra-ui/zag/commit/5584a833151ee9f2c2ef9c07b6d699addfbca18e)]:
  - @zag-js/core@0.78.3
  - @zag-js/anatomy@0.78.3
  - @zag-js/types@0.78.3
  - @zag-js/utils@0.78.3
  - @zag-js/dom-query@0.78.3
  - @zag-js/file-utils@0.78.3
  - @zag-js/i18n-utils@0.78.3

## 0.78.2

### Patch Changes

- [#2037](https://github.com/chakra-ui/zag/pull/2037)
  [`e58126f`](https://github.com/chakra-ui/zag/commit/e58126f3ae0def8cf0a1c14ee917ede7405e8cf4) Thanks
  [@anubra266](https://github.com/anubra266)! - Expose `acceptedFiles` and `rejectedFiles` to validate file method. This
  is useful for checking for duplicate files.

  ```ts
  fileUpload.machine({
    validate(file, details) {
      const { acceptedFiles, rejectedFiles } = details
      // Check for duplicate files by comparing names in acceptedFiles
      const duplicate = acceptedFiles.some((item) => item.name === file.name)
      if (duplicate) return ["FILE_EXISTS"]
      return null // No errors
    },
  })
  ```

- Updated dependencies [[`ce85272`](https://github.com/chakra-ui/zag/commit/ce85272c3d64dd4c7bae911ec4e4b813234850c2)]:
  - @zag-js/dom-query@0.78.2
  - @zag-js/i18n-utils@0.78.2
  - @zag-js/file-utils@0.78.2
  - @zag-js/anatomy@0.78.2
  - @zag-js/core@0.78.2
  - @zag-js/types@0.78.2
  - @zag-js/utils@0.78.2

## 0.78.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.1
  - @zag-js/core@0.78.1
  - @zag-js/types@0.78.1
  - @zag-js/utils@0.78.1
  - @zag-js/dom-query@0.78.1
  - @zag-js/file-utils@0.78.1
  - @zag-js/i18n-utils@0.78.1

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.0
  - @zag-js/core@0.78.0
  - @zag-js/types@0.78.0
  - @zag-js/utils@0.78.0
  - @zag-js/dom-query@0.78.0
  - @zag-js/file-utils@0.78.0
  - @zag-js/i18n-utils@0.78.0

## 0.77.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.77.1
  - @zag-js/core@0.77.1
  - @zag-js/types@0.77.1
  - @zag-js/utils@0.77.1
  - @zag-js/dom-query@0.77.1
  - @zag-js/file-utils@0.77.1
  - @zag-js/i18n-utils@0.77.1

## 0.77.0

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/dom-query@0.77.0
  - @zag-js/utils@0.77.0
  - @zag-js/i18n-utils@0.77.0
  - @zag-js/core@0.77.0
  - @zag-js/file-utils@0.77.0
  - @zag-js/anatomy@0.77.0
  - @zag-js/types@0.77.0

## 0.76.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.76.0
  - @zag-js/core@0.76.0
  - @zag-js/types@0.76.0
  - @zag-js/utils@0.76.0
  - @zag-js/dom-query@0.76.0
  - @zag-js/file-utils@0.76.0
  - @zag-js/i18n-utils@0.76.0

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.75.0
  - @zag-js/core@0.75.0
  - @zag-js/types@0.75.0
  - @zag-js/utils@0.75.0
  - @zag-js/dom-query@0.75.0
  - @zag-js/file-utils@0.75.0
  - @zag-js/i18n-utils@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.2
  - @zag-js/core@0.74.2
  - @zag-js/types@0.74.2
  - @zag-js/utils@0.74.2
  - @zag-js/dom-query@0.74.2
  - @zag-js/file-utils@0.74.2
  - @zag-js/i18n-utils@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.1
  - @zag-js/core@0.74.1
  - @zag-js/types@0.74.1
  - @zag-js/utils@0.74.1
  - @zag-js/dom-query@0.74.1
  - @zag-js/file-utils@0.74.1
  - @zag-js/i18n-utils@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.0
  - @zag-js/core@0.74.0
  - @zag-js/types@0.74.0
  - @zag-js/utils@0.74.0
  - @zag-js/dom-query@0.74.0
  - @zag-js/file-utils@0.74.0
  - @zag-js/i18n-utils@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.1
  - @zag-js/core@0.73.1
  - @zag-js/types@0.73.1
  - @zag-js/utils@0.73.1
  - @zag-js/dom-query@0.73.1
  - @zag-js/file-utils@0.73.1
  - @zag-js/i18n-utils@0.73.1

## 0.73.0

### Patch Changes

- [`8bbea0a`](https://github.com/chakra-ui/zag/commit/8bbea0a00d7e87b213aad84f730cc5fb6a0ce199) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `acceptedFiles` is removed after an invalid file
  is uploaded

- Updated dependencies []:
  - @zag-js/anatomy@0.73.0
  - @zag-js/core@0.73.0
  - @zag-js/types@0.73.0
  - @zag-js/utils@0.73.0
  - @zag-js/dom-query@0.73.0
  - @zag-js/file-utils@0.73.0
  - @zag-js/i18n-utils@0.73.0

## 0.72.0

### Patch Changes

- Updated dependencies [[`cdeaed6`](https://github.com/chakra-ui/zag/commit/cdeaed620f918a1684934081815e94ed76a8c388)]:
  - @zag-js/i18n-utils@0.72.0
  - @zag-js/file-utils@0.72.0
  - @zag-js/anatomy@0.72.0
  - @zag-js/core@0.72.0
  - @zag-js/types@0.72.0
  - @zag-js/utils@0.72.0
  - @zag-js/dom-query@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

- [`c9616cb`](https://github.com/chakra-ui/zag/commit/c9616cb6bdc8028648f799e9771ff49f00e03454) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `api.getClearTriggerProps()` to render a clear
  trigger that clears the accepted files.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/core@0.71.0
  - @zag-js/anatomy@0.71.0
  - @zag-js/types@0.71.0
  - @zag-js/utils@0.71.0
  - @zag-js/dom-query@0.71.0
  - @zag-js/file-utils@0.71.0
  - @zag-js/i18n-utils@0.71.0

## 0.70.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.70.0
  - @zag-js/core@0.70.0
  - @zag-js/types@0.70.0
  - @zag-js/utils@0.70.0
  - @zag-js/dom-query@0.70.0
  - @zag-js/file-utils@0.70.0
  - @zag-js/i18n-utils@0.70.0

## 0.69.0

### Patch Changes

- [`7a6b6e7`](https://github.com/chakra-ui/zag/commit/7a6b6e7fff9de69620d47431515bc0a4cdac3c75) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `directory: true` doesn't work

- Updated dependencies [[`bf57d7b`](https://github.com/chakra-ui/zag/commit/bf57d7b3933daf9974eaefc443da6f3c37706bb4)]:
  - @zag-js/dom-query@0.69.0
  - @zag-js/i18n-utils@0.69.0
  - @zag-js/file-utils@0.69.0
  - @zag-js/anatomy@0.69.0
  - @zag-js/core@0.69.0
  - @zag-js/types@0.69.0
  - @zag-js/utils@0.69.0

## 0.68.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.1
  - @zag-js/core@0.68.1
  - @zag-js/types@0.68.1
  - @zag-js/utils@0.68.1
  - @zag-js/dom-query@0.68.1
  - @zag-js/file-utils@0.68.1
  - @zag-js/i18n-utils@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.0
  - @zag-js/core@0.68.0
  - @zag-js/types@0.68.0
  - @zag-js/utils@0.68.0
  - @zag-js/dom-query@0.68.0
  - @zag-js/file-utils@0.68.0
  - @zag-js/i18n-utils@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.67.0
  - @zag-js/core@0.67.0
  - @zag-js/types@0.67.0
  - @zag-js/utils@0.67.0
  - @zag-js/dom-query@0.67.0
  - @zag-js/file-utils@0.67.0
  - @zag-js/i18n-utils@0.67.0

## 0.66.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.1
  - @zag-js/core@0.66.1
  - @zag-js/types@0.66.1
  - @zag-js/utils@0.66.1
  - @zag-js/dom-query@0.66.1
  - @zag-js/file-utils@0.66.1
  - @zag-js/i18n-utils@0.66.1

## 0.66.0

### Minor Changes

- [`4c1923e`](https://github.com/chakra-ui/zag/commit/4c1923e2de9c4ace2de96b4c177478f53dde1f35) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for `invalid` prop in file upload to explicitly mark
  upload operation as invalid. This could be paired with the `rejectedFiles` to show an error message.

### Patch Changes

- Updated dependencies [[`e3a21a6`](https://github.com/chakra-ui/zag/commit/e3a21a6aad1b8c549bee41f410e2cf5c1e355a64)]:
  - @zag-js/file-utils@0.66.0
  - @zag-js/anatomy@0.66.0
  - @zag-js/core@0.66.0
  - @zag-js/types@0.66.0
  - @zag-js/utils@0.66.0
  - @zag-js/dom-query@0.66.0
  - @zag-js/i18n-utils@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.1
  - @zag-js/core@0.65.1
  - @zag-js/types@0.65.1
  - @zag-js/utils@0.65.1
  - @zag-js/dom-query@0.65.1
  - @zag-js/file-utils@0.65.1
  - @zag-js/i18n-utils@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.0
  - @zag-js/core@0.65.0
  - @zag-js/types@0.65.0
  - @zag-js/utils@0.65.0
  - @zag-js/dom-query@0.65.0
  - @zag-js/file-utils@0.65.0
  - @zag-js/i18n-utils@0.65.0

## 0.64.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.64.0
  - @zag-js/core@0.64.0
  - @zag-js/types@0.64.0
  - @zag-js/utils@0.64.0
  - @zag-js/dom-query@0.64.0
  - @zag-js/file-utils@0.64.0
  - @zag-js/i18n-utils@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies [[`ca437b9`](https://github.com/chakra-ui/zag/commit/ca437b94b49760742bad69aa57a3d6527219782a)]:
  - @zag-js/dom-query@0.63.0
  - @zag-js/i18n-utils@0.63.0
  - @zag-js/file-utils@0.63.0
  - @zag-js/anatomy@0.63.0
  - @zag-js/core@0.63.0
  - @zag-js/types@0.63.0
  - @zag-js/utils@0.63.0

## 0.62.1

### Patch Changes

- Updated dependencies [[`5644790`](https://github.com/chakra-ui/zag/commit/564479081d37cd06bc38043fccf9c229379a1531)]:
  - @zag-js/core@0.62.1
  - @zag-js/anatomy@0.62.1
  - @zag-js/types@0.62.1
  - @zag-js/utils@0.62.1
  - @zag-js/dom-query@0.62.1
  - @zag-js/file-utils@0.62.1
  - @zag-js/i18n-utils@0.62.1

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.62.0
  - @zag-js/core@0.62.0
  - @zag-js/types@0.62.0
  - @zag-js/utils@0.62.0
  - @zag-js/dom-query@0.62.0
  - @zag-js/file-utils@0.62.0
  - @zag-js/i18n-utils@0.62.0

## 0.61.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.1
  - @zag-js/core@0.61.1
  - @zag-js/types@0.61.1
  - @zag-js/utils@0.61.1
  - @zag-js/dom-query@0.61.1
  - @zag-js/file-utils@0.61.1
  - @zag-js/i18n-utils@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.0
  - @zag-js/core@0.61.0
  - @zag-js/types@0.61.0
  - @zag-js/utils@0.61.0
  - @zag-js/dom-query@0.61.0
  - @zag-js/file-utils@0.61.0
  - @zag-js/i18n-utils@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.60.0
  - @zag-js/anatomy@0.60.0
  - @zag-js/types@0.60.0
  - @zag-js/utils@0.60.0
  - @zag-js/dom-query@0.60.0
  - @zag-js/file-utils@0.60.0
  - @zag-js/i18n-utils@0.60.0

## 0.59.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.59.0
  - @zag-js/core@0.59.0
  - @zag-js/types@0.59.0
  - @zag-js/utils@0.59.0
  - @zag-js/dom-query@0.59.0
  - @zag-js/file-utils@0.59.0
  - @zag-js/i18n-utils@0.59.0

## 0.58.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.3
  - @zag-js/core@0.58.3
  - @zag-js/types@0.58.3
  - @zag-js/utils@0.58.3
  - @zag-js/dom-query@0.58.3
  - @zag-js/file-utils@0.58.3
  - @zag-js/i18n-utils@0.58.3

## 0.58.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.2
  - @zag-js/core@0.58.2
  - @zag-js/types@0.58.2
  - @zag-js/utils@0.58.2
  - @zag-js/dom-query@0.58.2
  - @zag-js/file-utils@0.58.2
  - @zag-js/i18n-utils@0.58.2

## 0.58.1

### Patch Changes

- [`bfcce0a`](https://github.com/chakra-ui/zag/commit/bfcce0a7fbba85d8c5d3d451c2e1ebba1c62a09e) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Export missing types

- Updated dependencies []:
  - @zag-js/anatomy@0.58.1
  - @zag-js/core@0.58.1
  - @zag-js/types@0.58.1
  - @zag-js/utils@0.58.1
  - @zag-js/dom-query@0.58.1
  - @zag-js/file-utils@0.58.1
  - @zag-js/i18n-utils@0.58.1

## 0.58.0

### Minor Changes

- [`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Ensure consistent application of form related properties like
  `invalid`, `required`, and `readOnly`
  - Export `Service` from all machines for use in Lit based components.

- [`0033e46`](https://github.com/chakra-ui/zag/commit/0033e46d0600bdee08619f514afb6afe85a0cca9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for `api.clearRejectedFiles` to allow clearing the
  rejected files programmatically.
  - Improve DX of the `accept` context property by providing autocompletions for common file types.

### Patch Changes

- Updated dependencies [[`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93)]:
  - @zag-js/dom-query@0.58.0
  - @zag-js/i18n-utils@0.58.0
  - @zag-js/file-utils@0.58.0
  - @zag-js/anatomy@0.58.0
  - @zag-js/core@0.58.0
  - @zag-js/types@0.58.0
  - @zag-js/utils@0.58.0

## 0.57.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.57.0
  - @zag-js/core@0.57.0
  - @zag-js/types@0.57.0
  - @zag-js/utils@0.57.0
  - @zag-js/dom-query@0.57.0
  - @zag-js/file-utils@0.57.0
  - @zag-js/i18n-utils@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.1
  - @zag-js/core@0.56.1
  - @zag-js/types@0.56.1
  - @zag-js/utils@0.56.1
  - @zag-js/dom-query@0.56.1
  - @zag-js/file-utils@0.56.1
  - @zag-js/i18n-utils@0.56.1

## 0.56.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.0
  - @zag-js/core@0.56.0
  - @zag-js/types@0.56.0
  - @zag-js/utils@0.56.0
  - @zag-js/dom-query@0.56.0
  - @zag-js/file-utils@0.56.0
  - @zag-js/i18n-utils@0.56.0

## 0.55.0

### Patch Changes

- [`c962169`](https://github.com/chakra-ui/zag/commit/c962169f64d0c99aeef38308c49df7abe116502e) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `onFileAccept` gets called when deleting an item
  via the delete trigger. Now, only `onFileChange` is called when deleting or calling `api.clearFiles`
- Updated dependencies []:
  - @zag-js/anatomy@0.55.0
  - @zag-js/core@0.55.0
  - @zag-js/types@0.55.0
  - @zag-js/utils@0.55.0
  - @zag-js/dom-query@0.55.0
  - @zag-js/file-utils@0.55.0
  - @zag-js/i18n-utils@0.55.0

## 0.54.0

### Patch Changes

- Updated dependencies [[`590c177`](https://github.com/chakra-ui/zag/commit/590c1779f5208fb99114c872175e779508f2f96d)]:
  - @zag-js/core@0.54.0
  - @zag-js/anatomy@0.54.0
  - @zag-js/types@0.54.0
  - @zag-js/utils@0.54.0
  - @zag-js/dom-query@0.54.0
  - @zag-js/file-utils@0.54.0
  - @zag-js/i18n-utils@0.54.0

## 0.53.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.53.0
  - @zag-js/core@0.53.0
  - @zag-js/types@0.53.0
  - @zag-js/utils@0.53.0
  - @zag-js/dom-query@0.53.0
  - @zag-js/file-utils@0.53.0
  - @zag-js/i18n-utils@0.53.0

## 0.52.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.52.0
  - @zag-js/core@0.52.0
  - @zag-js/types@0.52.0
  - @zag-js/utils@0.52.0
  - @zag-js/dom-query@0.52.0
  - @zag-js/file-utils@0.52.0
  - @zag-js/i18n-utils@0.52.0

## 0.51.2

### Patch Changes

- [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where keydown event might not fire in React due to
  `nativeEvent` currentTarget not been set sometimes.

- Updated dependencies [[`62eb21b`](https://github.com/chakra-ui/zag/commit/62eb21b60355dd0645936baf4692315134e7488c),
  [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc)]:
  - @zag-js/core@0.51.2
  - @zag-js/dom-query@0.51.2
  - @zag-js/i18n-utils@0.51.2
  - @zag-js/file-utils@0.51.2
  - @zag-js/anatomy@0.51.2
  - @zag-js/types@0.51.2
  - @zag-js/utils@0.51.2

## 0.51.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.1
  - @zag-js/core@0.51.1
  - @zag-js/types@0.51.1
  - @zag-js/utils@0.51.1
  - @zag-js/dom-query@0.51.1
  - @zag-js/file-utils@0.51.1
  - @zag-js/i18n-utils@0.51.1

## 0.51.0

### Patch Changes

- [`903dd32`](https://github.com/chakra-ui/zag/commit/903dd325ecb1efbb9a97693e31c933107d4be295) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where hidden input doesn't include the file list when
  dropping files on the dropzone

- Updated dependencies []:
  - @zag-js/anatomy@0.51.0
  - @zag-js/core@0.51.0
  - @zag-js/types@0.51.0
  - @zag-js/utils@0.51.0
  - @zag-js/dom-query@0.51.0
  - @zag-js/file-utils@0.51.0
  - @zag-js/i18n-utils@0.51.0

## 0.50.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.50.0
  - @zag-js/core@0.50.0
  - @zag-js/types@0.50.0
  - @zag-js/utils@0.50.0
  - @zag-js/dom-query@0.50.0
  - @zag-js/file-utils@0.50.0
  - @zag-js/i18n-utils@0.50.0

## 0.49.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.49.0
  - @zag-js/anatomy@0.49.0
  - @zag-js/types@0.49.0
  - @zag-js/utils@0.49.0
  - @zag-js/dom-query@0.49.0
  - @zag-js/file-utils@0.49.0
  - @zag-js/i18n-utils@0.49.0

## 0.48.0

### Minor Changes

- [#1435](https://github.com/chakra-ui/zag/pull/1435)
  [`23ed828`](https://github.com/chakra-ui/zag/commit/23ed8283e8190fc9fb6496f4ba8c5eff78bda2d7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `api` properties
  - `isDragging` -> `dragging`
  - `isFocused` -> `focused`
  - `open()` -> `openFilePicker()`

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.48.0
  - @zag-js/core@0.48.0
  - @zag-js/types@0.48.0
  - @zag-js/utils@0.48.0
  - @zag-js/dom-query@0.48.0
  - @zag-js/file-utils@0.48.0
  - @zag-js/i18n-utils@0.48.0

## 0.47.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.47.0
  - @zag-js/core@0.47.0
  - @zag-js/types@0.47.0
  - @zag-js/utils@0.47.0
  - @zag-js/dom-query@0.47.0
  - @zag-js/file-utils@0.47.0
  - @zag-js/i18n-utils@0.47.0
  - @zag-js/visually-hidden@0.47.0

## 0.46.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.46.0
  - @zag-js/core@0.46.0
  - @zag-js/types@0.46.0
  - @zag-js/utils@0.46.0
  - @zag-js/dom-query@0.46.0
  - @zag-js/file-utils@0.46.0
  - @zag-js/i18n-utils@0.46.0
  - @zag-js/visually-hidden@0.46.0

## 0.45.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.45.0
  - @zag-js/core@0.45.0
  - @zag-js/types@0.45.0
  - @zag-js/utils@0.45.0
  - @zag-js/dom-query@0.45.0
  - @zag-js/file-utils@0.45.0
  - @zag-js/i18n-utils@0.45.0
  - @zag-js/visually-hidden@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.44.0
  - @zag-js/core@0.44.0
  - @zag-js/types@0.44.0
  - @zag-js/utils@0.44.0
  - @zag-js/dom-query@0.44.0
  - @zag-js/file-utils@0.44.0
  - @zag-js/i18n-utils@0.44.0
  - @zag-js/visually-hidden@0.44.0

## 0.43.0

### Minor Changes

- [`22c42c0`](https://github.com/chakra-ui/zag/commit/22c42c0e4287929ab964ca6fd772fc4d1ce3fbe3) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Remove `files` form user defined context. File upload, just like
  `<input type=file>`, is largely a readonly operation that can't be set by the user.

  > Consider using the `onFileChange` event to handle file changes.
  - Rename `api.files` to `api.acceptedFiles`
  - Rename `onFilesChange` to `onFileChange`

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.43.0
  - @zag-js/core@0.43.0
  - @zag-js/types@0.43.0
  - @zag-js/utils@0.43.0
  - @zag-js/dom-query@0.43.0
  - @zag-js/file-utils@0.43.0
  - @zag-js/i18n-utils@0.43.0
  - @zag-js/visually-hidden@0.43.0

## 0.42.0

### Minor Changes

- [`9a6d65a`](https://github.com/chakra-ui/zag/commit/9a6d65acc45b545cd09b79397589c859d692d86b) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support selecting directories via `directory` prop
  - Add support for `capture` property that specifies which camera to use for capture of image or video

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.42.0
  - @zag-js/core@0.42.0
  - @zag-js/types@0.42.0
  - @zag-js/utils@0.42.0
  - @zag-js/dom-query@0.42.0
  - @zag-js/file-utils@0.42.0
  - @zag-js/i18n-utils@0.42.0
  - @zag-js/visually-hidden@0.42.0

## 0.41.0

### Patch Changes

- Updated dependencies [[`d19851a`](https://github.com/chakra-ui/zag/commit/d19851adf36ee291b8e3284def27700864304a50)]:
  - @zag-js/i18n-utils@0.41.0
  - @zag-js/file-utils@0.41.0
  - @zag-js/anatomy@0.41.0
  - @zag-js/core@0.41.0
  - @zag-js/types@0.41.0
  - @zag-js/utils@0.41.0
  - @zag-js/dom-query@0.41.0
  - @zag-js/visually-hidden@0.41.0

## 0.40.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.40.0
  - @zag-js/core@0.40.0
  - @zag-js/types@0.40.0
  - @zag-js/utils@0.40.0
  - @zag-js/dom-query@0.40.0
  - @zag-js/file-utils@0.40.0
  - @zag-js/i18n-utils@0.40.0
  - @zag-js/visually-hidden@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.39.0
  - @zag-js/core@0.39.0
  - @zag-js/types@0.39.0
  - @zag-js/utils@0.39.0
  - @zag-js/dom-query@0.39.0
  - @zag-js/file-utils@0.39.0
  - @zag-js/i18n-utils@0.39.0
  - @zag-js/visually-hidden@0.39.0

## 0.38.1

### Patch Changes

- [#1331](https://github.com/chakra-ui/zag/pull/1331)
  [`dd1eeb9`](https://github.com/chakra-ui/zag/commit/dd1eeb919af569f7bbf730828b216e9f01d11af1) Thanks
  [@Pagebakers](https://github.com/Pagebakers)! - Fixed an issue where onFileReject would not be called

- Updated dependencies []:
  - @zag-js/anatomy@0.38.1
  - @zag-js/core@0.38.1
  - @zag-js/types@0.38.1
  - @zag-js/utils@0.38.1
  - @zag-js/dom-query@0.38.1
  - @zag-js/file-utils@0.38.1
  - @zag-js/visually-hidden@0.38.1

## 0.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.0
  - @zag-js/core@0.38.0
  - @zag-js/types@0.38.0
  - @zag-js/utils@0.38.0
  - @zag-js/dom-query@0.38.0
  - @zag-js/file-utils@0.38.0
  - @zag-js/visually-hidden@0.38.0

## 0.37.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.3
  - @zag-js/core@0.37.3
  - @zag-js/types@0.37.3
  - @zag-js/utils@0.37.3
  - @zag-js/dom-query@0.37.3
  - @zag-js/file-utils@0.37.3
  - @zag-js/visually-hidden@0.37.3

## 0.37.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.2
  - @zag-js/core@0.37.2
  - @zag-js/types@0.37.2
  - @zag-js/utils@0.37.2
  - @zag-js/dom-query@0.37.2
  - @zag-js/file-utils@0.37.2
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
  - @zag-js/utils@0.37.1
  - @zag-js/dom-query@0.37.1
  - @zag-js/file-utils@0.37.1
  - @zag-js/visually-hidden@0.37.1

## 0.37.0

### Patch Changes

- Updated dependencies [[`170c115`](https://github.com/chakra-ui/zag/commit/170c115afe6f1e5f5bf744508ddb98230a741391),
  [`2a024fb`](https://github.com/chakra-ui/zag/commit/2a024fbd2e98343218d4d658e91f1d8c751e1a4d)]:
  - @zag-js/file-utils@0.37.0
  - @zag-js/types@0.37.0
  - @zag-js/anatomy@0.37.0
  - @zag-js/core@0.37.0
  - @zag-js/utils@0.37.0
  - @zag-js/dom-query@0.37.0
  - @zag-js/visually-hidden@0.37.0

## 0.36.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.3
  - @zag-js/core@0.36.3
  - @zag-js/types@0.36.3
  - @zag-js/utils@0.36.3
  - @zag-js/dom-query@0.36.3
  - @zag-js/file-utils@0.36.3
  - @zag-js/visually-hidden@0.36.3

## 0.36.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.2
  - @zag-js/core@0.36.2
  - @zag-js/types@0.36.2
  - @zag-js/utils@0.36.2
  - @zag-js/dom-query@0.36.2
  - @zag-js/file-utils@0.36.2
  - @zag-js/visually-hidden@0.36.2

## 0.36.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.1
  - @zag-js/core@0.36.1
  - @zag-js/types@0.36.1
  - @zag-js/utils@0.36.1
  - @zag-js/dom-query@0.36.1
  - @zag-js/file-utils@0.36.1
  - @zag-js/visually-hidden@0.36.1

## 0.36.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.0
  - @zag-js/core@0.36.0
  - @zag-js/types@0.36.0
  - @zag-js/utils@0.36.0
  - @zag-js/dom-query@0.36.0
  - @zag-js/file-utils@0.36.0
  - @zag-js/visually-hidden@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [[`0216161`](https://github.com/chakra-ui/zag/commit/0216161fd3d429409abc96941d33a0c333ef8d36)]:
  - @zag-js/core@0.35.0
  - @zag-js/anatomy@0.35.0
  - @zag-js/types@0.35.0
  - @zag-js/utils@0.35.0
  - @zag-js/dom-query@0.35.0
  - @zag-js/file-utils@0.35.0
  - @zag-js/visually-hidden@0.35.0

## 0.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.34.0
  - @zag-js/core@0.34.0
  - @zag-js/types@0.34.0
  - @zag-js/utils@0.34.0
  - @zag-js/dom-query@0.34.0
  - @zag-js/file-utils@0.34.0
  - @zag-js/visually-hidden@0.34.0

## 0.33.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.33.2
  - @zag-js/core@0.33.2
  - @zag-js/types@0.33.2
  - @zag-js/utils@0.33.2
  - @zag-js/dom-query@0.33.2
  - @zag-js/file-utils@0.33.2
  - @zag-js/visually-hidden@0.33.2

## 0.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.33.1
  - @zag-js/anatomy@0.33.1
  - @zag-js/types@0.33.1
  - @zag-js/utils@0.33.1
  - @zag-js/dom-query@0.33.1
  - @zag-js/file-utils@0.33.1
  - @zag-js/visually-hidden@0.33.1

## 0.33.0

### Patch Changes

- Updated dependencies [[`7872cdf`](https://github.com/chakra-ui/zag/commit/7872cdf8aeb28b9a30cd4a016bd12e5366054511)]:
  - @zag-js/core@0.33.0
  - @zag-js/anatomy@0.33.0
  - @zag-js/types@0.33.0
  - @zag-js/utils@0.33.0
  - @zag-js/dom-query@0.33.0
  - @zag-js/file-utils@0.33.0
  - @zag-js/visually-hidden@0.33.0

## 0.32.1

### Patch Changes

- [#1156](https://github.com/chakra-ui/zag/pull/1156)
  [`11399e2`](https://github.com/chakra-ui/zag/commit/11399e224be3cd0d549c9b2a6afb6cace58ada43) Thanks
  [@Omikorin](https://github.com/Omikorin)! - Fix issue where some change details typings were no exported

- Updated dependencies []:
  - @zag-js/anatomy@0.32.1
  - @zag-js/core@0.32.1
  - @zag-js/types@0.32.1
  - @zag-js/utils@0.32.1
  - @zag-js/dom-query@0.32.1
  - @zag-js/file-utils@0.32.1
  - @zag-js/visually-hidden@0.32.1

## 0.32.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.32.0
  - @zag-js/core@0.32.0
  - @zag-js/types@0.32.0
  - @zag-js/utils@0.32.0
  - @zag-js/dom-query@0.32.0
  - @zag-js/file-utils@0.32.0
  - @zag-js/visually-hidden@0.32.0

## 0.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.1
  - @zag-js/core@0.31.1
  - @zag-js/types@0.31.1
  - @zag-js/utils@0.31.1
  - @zag-js/dom-query@0.31.1
  - @zag-js/file-utils@0.31.1
  - @zag-js/visually-hidden@0.31.1

## 0.31.0

### Minor Changes

- [`e02fc592`](https://github.com/chakra-ui/zag/commit/e02fc59202a8a72f66de6ce63c74df492cc57664) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for `onFileAccept` and `onFileReject` callbacks.
  - Add support customizing `ids` and aria labels using `messages` context property.
  - **Breaking**: Update file error types
    - `TOO_MANY_FILES_REJECTION` > `TOO_MANY_FILES`
    - `TOO_LARGE` > `FILE_TOO_LARGE`
    - `TOO_SMALL` > `FILE_TOO_SMALL`

- [`bbfbeced`](https://github.com/chakra-ui/zag/commit/bbfbeced95302901177d2755bafdc6543f527c54) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Add item preview mage part for File Upload

### Patch Changes

- Updated dependencies [[`e02fc592`](https://github.com/chakra-ui/zag/commit/e02fc59202a8a72f66de6ce63c74df492cc57664)]:
  - @zag-js/file-utils@0.31.0
  - @zag-js/anatomy@0.31.0
  - @zag-js/core@0.31.0
  - @zag-js/types@0.31.0
  - @zag-js/utils@0.31.0
  - @zag-js/dom-query@0.31.0
  - @zag-js/visually-hidden@0.31.0

## 0.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.30.0
  - @zag-js/core@0.30.0
  - @zag-js/types@0.30.0
  - @zag-js/utils@0.30.0
  - @zag-js/dom-query@0.30.0
  - @zag-js/file-utils@0.30.0
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
  - @zag-js/utils@0.29.0
  - @zag-js/dom-query@0.29.0
  - @zag-js/file-utils@0.29.0
  - @zag-js/visually-hidden@0.29.0

## 0.28.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.28.1
  - @zag-js/core@0.28.1
  - @zag-js/types@0.28.1
  - @zag-js/utils@0.28.1
  - @zag-js/dom-query@0.28.1
  - @zag-js/file-utils@0.28.1
  - @zag-js/visually-hidden@0.28.1

## 0.28.0

### Patch Changes

- Updated dependencies [[`e433b3ee`](https://github.com/chakra-ui/zag/commit/e433b3ee5b49a1099b8be2df99a4a5056fc1ecfd)]:
  - @zag-js/utils@0.28.0
  - @zag-js/core@0.28.0
  - @zag-js/anatomy@0.28.0
  - @zag-js/types@0.28.0
  - @zag-js/dom-query@0.28.0
  - @zag-js/file-utils@0.28.0
  - @zag-js/visually-hidden@0.28.0

## 0.27.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.27.1
  - @zag-js/core@0.27.1
  - @zag-js/types@0.27.1
  - @zag-js/utils@0.27.1
  - @zag-js/dom-query@0.27.1
  - @zag-js/file-utils@0.27.1
  - @zag-js/visually-hidden@0.27.1

## 0.27.0

### Patch Changes

- Updated dependencies [[`152b0a78`](https://github.com/chakra-ui/zag/commit/152b0a78b6ba18442f38164ce90789bc243f6e00)]:
  - @zag-js/core@0.27.0
  - @zag-js/anatomy@0.27.0
  - @zag-js/types@0.27.0
  - @zag-js/utils@0.27.0
  - @zag-js/dom-query@0.27.0
  - @zag-js/file-utils@0.27.0
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
  - @zag-js/utils@0.26.0
  - @zag-js/dom-query@0.26.0
  - @zag-js/file-utils@0.26.0
  - @zag-js/visually-hidden@0.26.0

## 0.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.25.0
  - @zag-js/core@0.25.0
  - @zag-js/types@0.25.0
  - @zag-js/utils@0.25.0
  - @zag-js/dom-query@0.25.0
  - @zag-js/file-utils@0.25.0
  - @zag-js/visually-hidden@0.25.0

## 0.24.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.24.0
  - @zag-js/core@0.24.0
  - @zag-js/types@0.24.0
  - @zag-js/utils@0.24.0
  - @zag-js/dom-query@0.24.0
  - @zag-js/file-utils@0.24.0
  - @zag-js/visually-hidden@0.24.0

## 0.23.0

### Minor Changes

- [#869](https://github.com/chakra-ui/zag/pull/869)
  [`bf574e5e`](https://github.com/chakra-ui/zag/commit/bf574e5e679f6047a40e0ea25804a3164d92c363) Thanks
  [@srflp](https://github.com/srflp)! - - Fix reopening the system file picker in file-upload on browsers other than
  Chrome
  - Redesign the file-upload component to include new parts:
    - `Item`: The element that represents a file
    - `ItemSizeText`: The element that represents the size of a file
    - `ItemName`: The element that represents the name of a file
    - `ItemDeleteTrigger`: The buttonelement used to delete a file
  - Added new `api.getFileSize` method to get the size of a file in a human readable format

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.23.0
  - @zag-js/core@0.23.0
  - @zag-js/types@0.23.0
  - @zag-js/utils@0.23.0
  - @zag-js/dom-query@0.23.0
  - @zag-js/file-utils@0.23.0
  - @zag-js/visually-hidden@0.23.0

## 0.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.22.0
  - @zag-js/core@0.22.0
  - @zag-js/types@0.22.0
  - @zag-js/utils@0.22.0
  - @zag-js/dom-query@0.22.0
  - @zag-js/visually-hidden@0.22.0

## 0.21.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.21.0
  - @zag-js/core@0.21.0
  - @zag-js/types@0.21.0
  - @zag-js/utils@0.21.0
  - @zag-js/dom-query@0.21.0
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
  - @zag-js/utils@0.20.0
  - @zag-js/dom-query@0.20.0
  - @zag-js/visually-hidden@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies [[`f5dff3f4`](https://github.com/chakra-ui/zag/commit/f5dff3f4e1a13d5315d3bcfcc1295952b46e4016),
  [`3f0b6a19`](https://github.com/chakra-ui/zag/commit/3f0b6a19dcf9779846efb2bc093235299301bbdb)]:
  - @zag-js/utils@0.19.1
  - @zag-js/core@0.19.1
  - @zag-js/anatomy@0.19.1
  - @zag-js/types@0.19.1
  - @zag-js/dom-query@0.19.1
  - @zag-js/visually-hidden@0.19.1

## 0.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.19.0
  - @zag-js/core@0.19.0
  - @zag-js/types@0.19.0
  - @zag-js/utils@0.19.0
  - @zag-js/dom-query@0.19.0
  - @zag-js/visually-hidden@0.19.0

## 0.18.0

### Patch Changes

- Updated dependencies [[`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa)]:
  - @zag-js/utils@0.18.0
  - @zag-js/core@0.18.0
  - @zag-js/anatomy@0.18.0
  - @zag-js/types@0.18.0
  - @zag-js/dom-query@0.18.0
  - @zag-js/visually-hidden@0.18.0

## 0.17.0

### Minor Changes

- [#789](https://github.com/chakra-ui/zag/pull/789)
  [`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor machine event handling and rename `PublicApi` to `Api`

### Patch Changes

- Updated dependencies [[`db81eaab`](https://github.com/chakra-ui/zag/commit/db81eaab8c8b06d74cf81d46fa145f4b480b7e82)]:
  - @zag-js/dom-query@0.17.0
  - @zag-js/anatomy@0.17.0
  - @zag-js/core@0.17.0
  - @zag-js/types@0.17.0
  - @zag-js/utils@0.17.0
  - @zag-js/visually-hidden@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dom-query@0.16.0
  - @zag-js/visually-hidden@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.15.0
  - @zag-js/core@0.15.0
  - @zag-js/types@0.15.0
  - @zag-js/utils@0.15.0
  - @zag-js/dom-query@0.15.0
  - @zag-js/visually-hidden@0.15.0

## 0.14.0

### Patch Changes

- [`887e231a`](https://github.com/chakra-ui/zag/commit/887e231ad3242895e036b4d04e438606a614ccd7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Rename `minSize` and `maxSize` to `minFileSize` and
  `maxFileSize` respectively
  - Rename `openFilePicker` to `open`
- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/utils@0.14.0
  - @zag-js/visually-hidden@0.14.0

## 0.13.0

### Patch Changes

- [`60df458c`](https://github.com/chakra-ui/zag/commit/60df458c005898b35ba81fc381e50e414352e9db) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-disabled` to parts

- Updated dependencies [[`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414)]:
  - @zag-js/core@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dom-query@0.13.0
  - @zag-js/visually-hidden@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.12.0
  - @zag-js/core@0.12.0
  - @zag-js/types@0.12.0
  - @zag-js/utils@0.12.0
  - @zag-js/dom-query@0.12.0
  - @zag-js/visually-hidden@0.12.0
