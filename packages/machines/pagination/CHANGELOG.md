# @zag-js/pagination

## 1.26.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.3
  - @zag-js/core@1.26.3
  - @zag-js/types@1.26.3
  - @zag-js/utils@1.26.3
  - @zag-js/dom-query@1.26.3

## 1.26.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.2
  - @zag-js/core@1.26.2
  - @zag-js/types@1.26.2
  - @zag-js/utils@1.26.2
  - @zag-js/dom-query@1.26.2

## 1.26.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.1
  - @zag-js/core@1.26.1
  - @zag-js/types@1.26.1
  - @zag-js/utils@1.26.1
  - @zag-js/dom-query@1.26.1

## 1.26.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.0
  - @zag-js/core@1.26.0
  - @zag-js/types@1.26.0
  - @zag-js/utils@1.26.0
  - @zag-js/dom-query@1.26.0

## 1.25.0

### Minor Changes

- [`cd6918e`](https://github.com/chakra-ui/zag/commit/cd6918e4ea85d2a1a7679822a5813e5d5e8125e7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `getPageUrl` prop for generating `href` attributes when using
  pagination as links.
  - Added `getPageUrl` function prop that receives `{ page, pageSize }` and returns a URL string
  - Only applies when `type="link"` to generate proper href attributes for pagination items and navigation buttons

  ```ts
  const service = useMachine(pagination.machine, {
    type: "link",
    getPageUrl: ({ page, pageSize }) => `/products?page=${page}&size=${pageSize}`,
  })
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.25.0
  - @zag-js/core@1.25.0
  - @zag-js/types@1.25.0
  - @zag-js/utils@1.25.0
  - @zag-js/dom-query@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies []:
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

## 1.24.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.0
  - @zag-js/core@1.24.0
  - @zag-js/types@1.24.0
  - @zag-js/utils@1.24.0
  - @zag-js/dom-query@1.24.0

## 1.23.0

### Patch Changes

- Updated dependencies [[`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac),
  [`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/dom-query@1.23.0
  - @zag-js/core@1.23.0
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

- Updated dependencies [[`dd1519a`](https://github.com/chakra-ui/zag/commit/dd1519a668f315e2feab7aed51007f3380880229)]:
  - @zag-js/dom-query@1.21.8
  - @zag-js/core@1.21.8
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

## 1.21.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.6
  - @zag-js/core@1.21.6
  - @zag-js/types@1.21.6
  - @zag-js/utils@1.21.6
  - @zag-js/dom-query@1.21.6

## 1.21.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.5
  - @zag-js/core@1.21.5
  - @zag-js/types@1.21.5
  - @zag-js/utils@1.21.5
  - @zag-js/dom-query@1.21.5

## 1.21.4

### Patch Changes

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

- Updated dependencies []:
  - @zag-js/anatomy@1.21.2
  - @zag-js/core@1.21.2
  - @zag-js/types@1.21.2
  - @zag-js/utils@1.21.2
  - @zag-js/dom-query@1.21.2

## 1.21.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.1
  - @zag-js/core@1.21.1
  - @zag-js/types@1.21.1
  - @zag-js/utils@1.21.1
  - @zag-js/dom-query@1.21.1

## 1.21.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.0
  - @zag-js/core@1.21.0
  - @zag-js/types@1.21.0
  - @zag-js/utils@1.21.0
  - @zag-js/dom-query@1.21.0

## 1.20.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.1
  - @zag-js/core@1.20.1
  - @zag-js/types@1.20.1
  - @zag-js/utils@1.20.1
  - @zag-js/dom-query@1.20.1

## 1.20.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.0
  - @zag-js/core@1.20.0
  - @zag-js/types@1.20.0
  - @zag-js/utils@1.20.0
  - @zag-js/dom-query@1.20.0

## 1.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.19.0
  - @zag-js/core@1.19.0
  - @zag-js/types@1.19.0
  - @zag-js/utils@1.19.0
  - @zag-js/dom-query@1.19.0

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

## 1.18.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.4
  - @zag-js/core@1.18.4
  - @zag-js/types@1.18.4
  - @zag-js/utils@1.18.4
  - @zag-js/dom-query@1.18.4

## 1.18.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.3
  - @zag-js/core@1.18.3
  - @zag-js/types@1.18.3
  - @zag-js/utils@1.18.3
  - @zag-js/dom-query@1.18.3

## 1.18.2

### Patch Changes

- Updated dependencies [[`11843e6`](https://github.com/chakra-ui/zag/commit/11843e6adf62b906006890c8003b38da2850c8ee)]:
  - @zag-js/utils@1.18.2
  - @zag-js/core@1.18.2
  - @zag-js/anatomy@1.18.2
  - @zag-js/types@1.18.2
  - @zag-js/dom-query@1.18.2

## 1.18.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.1
  - @zag-js/core@1.18.1
  - @zag-js/types@1.18.1
  - @zag-js/utils@1.18.1
  - @zag-js/dom-query@1.18.1

## 1.18.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.0
  - @zag-js/core@1.18.0
  - @zag-js/types@1.18.0
  - @zag-js/utils@1.18.0
  - @zag-js/dom-query@1.18.0

## 1.17.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.4
  - @zag-js/core@1.17.4
  - @zag-js/types@1.17.4
  - @zag-js/utils@1.17.4
  - @zag-js/dom-query@1.17.4

## 1.17.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.3
  - @zag-js/core@1.17.3
  - @zag-js/types@1.17.3
  - @zag-js/utils@1.17.3
  - @zag-js/dom-query@1.17.3

## 1.17.2

### Patch Changes

- Updated dependencies []:
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

## 1.17.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.0
  - @zag-js/core@1.17.0
  - @zag-js/types@1.17.0
  - @zag-js/utils@1.17.0
  - @zag-js/dom-query@1.17.0

## 1.16.0

### Patch Changes

- Updated dependencies [[`6f6c8f3`](https://github.com/chakra-ui/zag/commit/6f6c8f329d9eb9d9889eff4317c84a4f41d4bfb2)]:
  - @zag-js/types@1.16.0
  - @zag-js/dom-query@1.16.0
  - @zag-js/core@1.16.0
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

## 1.15.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.6
  - @zag-js/core@1.15.6
  - @zag-js/types@1.15.6
  - @zag-js/utils@1.15.6
  - @zag-js/dom-query@1.15.6

## 1.15.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.5
  - @zag-js/core@1.15.5
  - @zag-js/types@1.15.5
  - @zag-js/utils@1.15.5
  - @zag-js/dom-query@1.15.5

## 1.15.4

### Patch Changes

- Updated dependencies [[`e5f698d`](https://github.com/chakra-ui/zag/commit/e5f698d082ea8ae7f9f45958c4e319de7c7b6107)]:
  - @zag-js/dom-query@1.15.4
  - @zag-js/core@1.15.4
  - @zag-js/anatomy@1.15.4
  - @zag-js/types@1.15.4
  - @zag-js/utils@1.15.4

## 1.15.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.3
  - @zag-js/core@1.15.3
  - @zag-js/types@1.15.3
  - @zag-js/utils@1.15.3
  - @zag-js/dom-query@1.15.3

## 1.15.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.2
  - @zag-js/core@1.15.2
  - @zag-js/types@1.15.2
  - @zag-js/utils@1.15.2
  - @zag-js/dom-query@1.15.2

## 1.15.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.1
  - @zag-js/core@1.15.1
  - @zag-js/types@1.15.1
  - @zag-js/utils@1.15.1
  - @zag-js/dom-query@1.15.1

## 1.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.0
  - @zag-js/core@1.15.0
  - @zag-js/types@1.15.0
  - @zag-js/utils@1.15.0
  - @zag-js/dom-query@1.15.0

## 1.14.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.14.0
  - @zag-js/core@1.14.0
  - @zag-js/types@1.14.0
  - @zag-js/utils@1.14.0
  - @zag-js/dom-query@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.1
  - @zag-js/core@1.13.1
  - @zag-js/types@1.13.1
  - @zag-js/utils@1.13.1
  - @zag-js/dom-query@1.13.1

## 1.13.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.0
  - @zag-js/core@1.13.0
  - @zag-js/types@1.13.0
  - @zag-js/utils@1.13.0
  - @zag-js/dom-query@1.13.0

## 1.12.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.4
  - @zag-js/core@1.12.4
  - @zag-js/types@1.12.4
  - @zag-js/utils@1.12.4
  - @zag-js/dom-query@1.12.4

## 1.12.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.3
  - @zag-js/core@1.12.3
  - @zag-js/types@1.12.3
  - @zag-js/utils@1.12.3
  - @zag-js/dom-query@1.12.3

## 1.12.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.2
  - @zag-js/core@1.12.2
  - @zag-js/types@1.12.2
  - @zag-js/utils@1.12.2
  - @zag-js/dom-query@1.12.2

## 1.12.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.1
  - @zag-js/core@1.12.1
  - @zag-js/types@1.12.1
  - @zag-js/utils@1.12.1
  - @zag-js/dom-query@1.12.1

## 1.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.0
  - @zag-js/core@1.12.0
  - @zag-js/types@1.12.0
  - @zag-js/utils@1.12.0
  - @zag-js/dom-query@1.12.0

## 1.11.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.11.0
  - @zag-js/core@1.11.0
  - @zag-js/types@1.11.0
  - @zag-js/utils@1.11.0
  - @zag-js/dom-query@1.11.0

## 1.10.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.10.0
  - @zag-js/core@1.10.0
  - @zag-js/types@1.10.0
  - @zag-js/utils@1.10.0
  - @zag-js/dom-query@1.10.0

## 1.9.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.3
  - @zag-js/core@1.9.3
  - @zag-js/types@1.9.3
  - @zag-js/utils@1.9.3
  - @zag-js/dom-query@1.9.3

## 1.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.2
  - @zag-js/core@1.9.2
  - @zag-js/types@1.9.2
  - @zag-js/utils@1.9.2
  - @zag-js/dom-query@1.9.2

## 1.9.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.1
  - @zag-js/core@1.9.1
  - @zag-js/types@1.9.1
  - @zag-js/utils@1.9.1
  - @zag-js/dom-query@1.9.1

## 1.9.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.0
  - @zag-js/core@1.9.0
  - @zag-js/types@1.9.0
  - @zag-js/utils@1.9.0
  - @zag-js/dom-query@1.9.0

## 1.8.2

### Patch Changes

- Updated dependencies [[`25d93b8`](https://github.com/chakra-ui/zag/commit/25d93b8be12e8df26ed04c5d298c66f54910fe85)]:
  - @zag-js/dom-query@1.8.2
  - @zag-js/core@1.8.2
  - @zag-js/anatomy@1.8.2
  - @zag-js/types@1.8.2
  - @zag-js/utils@1.8.2

## 1.8.1

### Patch Changes

- Updated dependencies [[`c3c1642`](https://github.com/chakra-ui/zag/commit/c3c164296cd643f2fb7c12c0d1fe9c406eba352f)]:
  - @zag-js/dom-query@1.8.1
  - @zag-js/core@1.8.1
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

## 1.7.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.7.0
  - @zag-js/core@1.7.0
  - @zag-js/types@1.7.0
  - @zag-js/utils@1.7.0
  - @zag-js/dom-query@1.7.0

## 1.6.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.2
  - @zag-js/core@1.6.2
  - @zag-js/types@1.6.2
  - @zag-js/utils@1.6.2
  - @zag-js/dom-query@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.1
  - @zag-js/core@1.6.1
  - @zag-js/types@1.6.1
  - @zag-js/utils@1.6.1
  - @zag-js/dom-query@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.0
  - @zag-js/core@1.6.0
  - @zag-js/types@1.6.0
  - @zag-js/utils@1.6.0
  - @zag-js/dom-query@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.5.0
  - @zag-js/core@1.5.0
  - @zag-js/types@1.5.0
  - @zag-js/utils@1.5.0
  - @zag-js/dom-query@1.5.0

## 1.4.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.2
  - @zag-js/core@1.4.2
  - @zag-js/types@1.4.2
  - @zag-js/utils@1.4.2
  - @zag-js/dom-query@1.4.2

## 1.4.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.1
  - @zag-js/core@1.4.1
  - @zag-js/types@1.4.1
  - @zag-js/utils@1.4.1
  - @zag-js/dom-query@1.4.1

## 1.4.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.0
  - @zag-js/core@1.4.0
  - @zag-js/types@1.4.0
  - @zag-js/utils@1.4.0
  - @zag-js/dom-query@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`66ba41b`](https://github.com/chakra-ui/zag/commit/66ba41bb10b232ff08e3cfbfc6cbf2a1c7449e21)]:
  - @zag-js/utils@1.3.3
  - @zag-js/core@1.3.3
  - @zag-js/anatomy@1.3.3
  - @zag-js/types@1.3.3
  - @zag-js/dom-query@1.3.3

## 1.3.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.2
  - @zag-js/core@1.3.2
  - @zag-js/types@1.3.2
  - @zag-js/utils@1.3.2
  - @zag-js/dom-query@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.1
  - @zag-js/core@1.3.1
  - @zag-js/types@1.3.1
  - @zag-js/utils@1.3.1
  - @zag-js/dom-query@1.3.1

## 1.3.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.0
  - @zag-js/core@1.3.0
  - @zag-js/types@1.3.0
  - @zag-js/utils@1.3.0
  - @zag-js/dom-query@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.1
  - @zag-js/core@1.2.1
  - @zag-js/types@1.2.1
  - @zag-js/utils@1.2.1
  - @zag-js/dom-query@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.0
  - @zag-js/core@1.2.0
  - @zag-js/types@1.2.0
  - @zag-js/utils@1.2.0
  - @zag-js/dom-query@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.1.0
  - @zag-js/core@1.1.0
  - @zag-js/types@1.1.0
  - @zag-js/utils@1.1.0
  - @zag-js/dom-query@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.0.2
  - @zag-js/core@1.0.2
  - @zag-js/types@1.0.2
  - @zag-js/utils@1.0.2
  - @zag-js/dom-query@1.0.2

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

## 1.0.0

### Patch Changes

- Updated dependencies [[`b1caa44`](https://github.com/chakra-ui/zag/commit/b1caa44085e7f1da0ad24fc7b25178081811646c)]:
  - @zag-js/core@1.0.0
  - @zag-js/anatomy@1.0.0
  - @zag-js/types@1.0.0
  - @zag-js/utils@1.0.0
  - @zag-js/dom-query@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.2
  - @zag-js/core@0.82.2
  - @zag-js/types@0.82.2
  - @zag-js/utils@0.82.2
  - @zag-js/dom-query@0.82.2

## 0.82.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.1
  - @zag-js/core@0.82.1
  - @zag-js/types@0.82.1
  - @zag-js/utils@0.82.1
  - @zag-js/dom-query@0.82.1

## 0.82.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.0
  - @zag-js/core@0.82.0
  - @zag-js/types@0.82.0
  - @zag-js/utils@0.82.0
  - @zag-js/dom-query@0.82.0

## 0.81.2

### Patch Changes

- Updated dependencies [[`e9313a3`](https://github.com/chakra-ui/zag/commit/e9313a3663285a05c9ac9ac92f1c09fcb27ac818)]:
  - @zag-js/dom-query@0.81.2
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

## 0.81.0

### Patch Changes

- [`ee914e9`](https://github.com/chakra-ui/zag/commit/ee914e9c2f02bb99a70d815993e379937a7ccd23) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where page range could return incorrect `end` value when
  `pageSize` is greater than `count`

- Updated dependencies [[`792939f`](https://github.com/chakra-ui/zag/commit/792939f9d9eac5a97cc46f1b0ab286666ba1edd8),
  [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68)]:
  - @zag-js/dom-query@0.81.0
  - @zag-js/types@0.81.0
  - @zag-js/anatomy@0.81.0
  - @zag-js/core@0.81.0
  - @zag-js/utils@0.81.0

## 0.80.0

### Patch Changes

- Updated dependencies [[`d7617d1`](https://github.com/chakra-ui/zag/commit/d7617d1d95f93b3557eb88ba879737894da42d51)]:
  - @zag-js/dom-query@0.80.0
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

## 0.79.2

### Patch Changes

- Updated dependencies [[`525e645`](https://github.com/chakra-ui/zag/commit/525e645404f56c10919cc9d36279044dff253a08)]:
  - @zag-js/dom-query@0.79.2
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

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.0
  - @zag-js/core@0.79.0
  - @zag-js/types@0.79.0
  - @zag-js/utils@0.79.0
  - @zag-js/dom-query@0.79.0

## 0.78.3

### Patch Changes

- Updated dependencies [[`5584a83`](https://github.com/chakra-ui/zag/commit/5584a833151ee9f2c2ef9c07b6d699addfbca18e)]:
  - @zag-js/core@0.78.3
  - @zag-js/anatomy@0.78.3
  - @zag-js/types@0.78.3
  - @zag-js/utils@0.78.3
  - @zag-js/dom-query@0.78.3

## 0.78.2

### Patch Changes

- Updated dependencies [[`ce85272`](https://github.com/chakra-ui/zag/commit/ce85272c3d64dd4c7bae911ec4e4b813234850c2)]:
  - @zag-js/dom-query@0.78.2
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

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.0
  - @zag-js/core@0.78.0
  - @zag-js/types@0.78.0
  - @zag-js/utils@0.78.0
  - @zag-js/dom-query@0.78.0

## 0.77.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.77.1
  - @zag-js/core@0.77.1
  - @zag-js/types@0.77.1
  - @zag-js/utils@0.77.1
  - @zag-js/dom-query@0.77.1

## 0.77.0

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/dom-query@0.77.0
  - @zag-js/utils@0.77.0
  - @zag-js/core@0.77.0
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

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.75.0
  - @zag-js/core@0.75.0
  - @zag-js/types@0.75.0
  - @zag-js/utils@0.75.0
  - @zag-js/dom-query@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.2
  - @zag-js/core@0.74.2
  - @zag-js/types@0.74.2
  - @zag-js/utils@0.74.2
  - @zag-js/dom-query@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.1
  - @zag-js/core@0.74.1
  - @zag-js/types@0.74.1
  - @zag-js/utils@0.74.1
  - @zag-js/dom-query@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.0
  - @zag-js/core@0.74.0
  - @zag-js/types@0.74.0
  - @zag-js/utils@0.74.0
  - @zag-js/dom-query@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.1
  - @zag-js/core@0.73.1
  - @zag-js/types@0.73.1
  - @zag-js/utils@0.73.1
  - @zag-js/dom-query@0.73.1

## 0.73.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.0
  - @zag-js/core@0.73.0
  - @zag-js/types@0.73.0
  - @zag-js/utils@0.73.0
  - @zag-js/dom-query@0.73.0

## 0.72.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.72.0
  - @zag-js/core@0.72.0
  - @zag-js/types@0.72.0
  - @zag-js/utils@0.72.0
  - @zag-js/dom-query@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/core@0.71.0
  - @zag-js/anatomy@0.71.0
  - @zag-js/types@0.71.0
  - @zag-js/utils@0.71.0
  - @zag-js/dom-query@0.71.0

## 0.70.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.70.0
  - @zag-js/core@0.70.0
  - @zag-js/types@0.70.0
  - @zag-js/utils@0.70.0
  - @zag-js/dom-query@0.70.0

## 0.69.0

### Patch Changes

- Updated dependencies [[`bf57d7b`](https://github.com/chakra-ui/zag/commit/bf57d7b3933daf9974eaefc443da6f3c37706bb4)]:
  - @zag-js/dom-query@0.69.0
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

## 0.68.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.0
  - @zag-js/core@0.68.0
  - @zag-js/types@0.68.0
  - @zag-js/utils@0.68.0
  - @zag-js/dom-query@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.67.0
  - @zag-js/core@0.67.0
  - @zag-js/types@0.67.0
  - @zag-js/utils@0.67.0
  - @zag-js/dom-query@0.67.0

## 0.66.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.1
  - @zag-js/core@0.66.1
  - @zag-js/types@0.66.1
  - @zag-js/utils@0.66.1
  - @zag-js/dom-query@0.66.1

## 0.66.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.0
  - @zag-js/core@0.66.0
  - @zag-js/types@0.66.0
  - @zag-js/utils@0.66.0
  - @zag-js/dom-query@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.1
  - @zag-js/core@0.65.1
  - @zag-js/types@0.65.1
  - @zag-js/utils@0.65.1
  - @zag-js/dom-query@0.65.1

## 0.65.0

### Minor Changes

- [`4ce5bed`](https://github.com/chakra-ui/zag/commit/4ce5bedf84bfb104a0cab1bdfb67f3a29a98e078) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `api.count` property

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.0
  - @zag-js/core@0.65.0
  - @zag-js/types@0.65.0
  - @zag-js/utils@0.65.0
  - @zag-js/dom-query@0.65.0

## 0.64.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.64.0
  - @zag-js/core@0.64.0
  - @zag-js/types@0.64.0
  - @zag-js/utils@0.64.0
  - @zag-js/dom-query@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies [[`ca437b9`](https://github.com/chakra-ui/zag/commit/ca437b94b49760742bad69aa57a3d6527219782a)]:
  - @zag-js/dom-query@0.63.0
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

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.62.0
  - @zag-js/core@0.62.0
  - @zag-js/types@0.62.0
  - @zag-js/utils@0.62.0
  - @zag-js/dom-query@0.62.0

## 0.61.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.1
  - @zag-js/core@0.61.1
  - @zag-js/types@0.61.1
  - @zag-js/utils@0.61.1
  - @zag-js/dom-query@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.0
  - @zag-js/core@0.61.0
  - @zag-js/types@0.61.0
  - @zag-js/utils@0.61.0
  - @zag-js/dom-query@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.60.0
  - @zag-js/anatomy@0.60.0
  - @zag-js/types@0.60.0
  - @zag-js/utils@0.60.0
  - @zag-js/dom-query@0.60.0

## 0.59.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.59.0
  - @zag-js/core@0.59.0
  - @zag-js/types@0.59.0
  - @zag-js/utils@0.59.0
  - @zag-js/dom-query@0.59.0

## 0.58.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.3
  - @zag-js/core@0.58.3
  - @zag-js/types@0.58.3
  - @zag-js/utils@0.58.3
  - @zag-js/dom-query@0.58.3

## 0.58.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.2
  - @zag-js/core@0.58.2
  - @zag-js/types@0.58.2
  - @zag-js/utils@0.58.2
  - @zag-js/dom-query@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.1
  - @zag-js/core@0.58.1
  - @zag-js/types@0.58.1
  - @zag-js/utils@0.58.1
  - @zag-js/dom-query@0.58.1

## 0.58.0

### Minor Changes

- [`47c118b`](https://github.com/chakra-ui/zag/commit/47c118b0c71012246e9db74da0f41b98049e015a) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Expose more functions to programmatically change the page
  - `api.goToNextPage()`
  - `api.goToPrevPage()`
  - `api.goToFirstPage()`
  - `api.goToLastPage()`

- [`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Ensure consistent application of form related properties like
  `invalid`, `required`, and `readOnly`
  - Export `Service` from all machines for use in Lit based components.

### Patch Changes

- Updated dependencies [[`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93)]:
  - @zag-js/dom-query@0.58.0
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

## 0.56.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.1
  - @zag-js/core@0.56.1
  - @zag-js/types@0.56.1
  - @zag-js/utils@0.56.1
  - @zag-js/dom-query@0.56.1

## 0.56.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.0
  - @zag-js/core@0.56.0
  - @zag-js/types@0.56.0
  - @zag-js/utils@0.56.0
  - @zag-js/dom-query@0.56.0

## 0.55.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.55.0
  - @zag-js/core@0.55.0
  - @zag-js/types@0.55.0
  - @zag-js/utils@0.55.0
  - @zag-js/dom-query@0.55.0

## 0.54.0

### Patch Changes

- Updated dependencies [[`590c177`](https://github.com/chakra-ui/zag/commit/590c1779f5208fb99114c872175e779508f2f96d)]:
  - @zag-js/core@0.54.0
  - @zag-js/anatomy@0.54.0
  - @zag-js/types@0.54.0
  - @zag-js/utils@0.54.0
  - @zag-js/dom-query@0.54.0

## 0.53.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.53.0
  - @zag-js/core@0.53.0
  - @zag-js/types@0.53.0
  - @zag-js/utils@0.53.0
  - @zag-js/dom-query@0.53.0

## 0.52.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.52.0
  - @zag-js/core@0.52.0
  - @zag-js/types@0.52.0
  - @zag-js/utils@0.52.0
  - @zag-js/dom-query@0.52.0

## 0.51.2

### Patch Changes

- Updated dependencies [[`62eb21b`](https://github.com/chakra-ui/zag/commit/62eb21b60355dd0645936baf4692315134e7488c),
  [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc)]:
  - @zag-js/core@0.51.2
  - @zag-js/dom-query@0.51.2
  - @zag-js/anatomy@0.51.2
  - @zag-js/types@0.51.2
  - @zag-js/utils@0.51.2

## 0.51.1

### Patch Changes

- [`fb26e39`](https://github.com/chakra-ui/zag/commit/fb26e3960845bab8f3c3f987de8c3e28b1b5e361) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Export missing PageSizeChangeDetails

- Updated dependencies []:
  - @zag-js/anatomy@0.51.1
  - @zag-js/core@0.51.1
  - @zag-js/types@0.51.1
  - @zag-js/utils@0.51.1
  - @zag-js/dom-query@0.51.1

## 0.51.0

### Minor Changes

- [`2b35349`](https://github.com/chakra-ui/zag/commit/2b35349b1c71bd26fb96afe4a8854a578a1eff7d) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add `api.pageSize` to allow retrieving the current page size
  - Add `onPageSizeChange` to listen for page size change

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.0
  - @zag-js/core@0.51.0
  - @zag-js/types@0.51.0
  - @zag-js/utils@0.51.0
  - @zag-js/dom-query@0.51.0

## 0.50.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.50.0
  - @zag-js/core@0.50.0
  - @zag-js/types@0.50.0
  - @zag-js/utils@0.50.0
  - @zag-js/dom-query@0.50.0

## 0.49.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.49.0
  - @zag-js/anatomy@0.49.0
  - @zag-js/types@0.49.0
  - @zag-js/utils@0.49.0
  - @zag-js/dom-query@0.49.0

## 0.48.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.48.0
  - @zag-js/core@0.48.0
  - @zag-js/types@0.48.0
  - @zag-js/utils@0.48.0
  - @zag-js/dom-query@0.48.0

## 0.47.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.47.0
  - @zag-js/core@0.47.0
  - @zag-js/types@0.47.0
  - @zag-js/utils@0.47.0
  - @zag-js/dom-query@0.47.0

## 0.46.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.46.0
  - @zag-js/core@0.46.0
  - @zag-js/types@0.46.0
  - @zag-js/utils@0.46.0
  - @zag-js/dom-query@0.46.0

## 0.45.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.45.0
  - @zag-js/core@0.45.0
  - @zag-js/types@0.45.0
  - @zag-js/utils@0.45.0
  - @zag-js/dom-query@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.44.0
  - @zag-js/core@0.44.0
  - @zag-js/types@0.44.0
  - @zag-js/utils@0.44.0
  - @zag-js/dom-query@0.44.0

## 0.43.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.43.0
  - @zag-js/core@0.43.0
  - @zag-js/types@0.43.0
  - @zag-js/utils@0.43.0
  - @zag-js/dom-query@0.43.0

## 0.42.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.42.0
  - @zag-js/core@0.42.0
  - @zag-js/types@0.42.0
  - @zag-js/utils@0.42.0
  - @zag-js/dom-query@0.42.0

## 0.41.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.41.0
  - @zag-js/core@0.41.0
  - @zag-js/types@0.41.0
  - @zag-js/utils@0.41.0
  - @zag-js/dom-query@0.41.0

## 0.40.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.40.0
  - @zag-js/core@0.40.0
  - @zag-js/types@0.40.0
  - @zag-js/utils@0.40.0
  - @zag-js/dom-query@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.39.0
  - @zag-js/core@0.39.0
  - @zag-js/types@0.39.0
  - @zag-js/utils@0.39.0
  - @zag-js/dom-query@0.39.0

## 0.38.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.1
  - @zag-js/core@0.38.1
  - @zag-js/types@0.38.1
  - @zag-js/utils@0.38.1
  - @zag-js/dom-query@0.38.1

## 0.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.0
  - @zag-js/core@0.38.0
  - @zag-js/types@0.38.0
  - @zag-js/utils@0.38.0
  - @zag-js/dom-query@0.38.0

## 0.37.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.3
  - @zag-js/core@0.37.3
  - @zag-js/types@0.37.3
  - @zag-js/utils@0.37.3
  - @zag-js/dom-query@0.37.3

## 0.37.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.2
  - @zag-js/core@0.37.2
  - @zag-js/types@0.37.2
  - @zag-js/utils@0.37.2
  - @zag-js/dom-query@0.37.2

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

## 0.37.0

### Patch Changes

- Updated dependencies [[`2a024fb`](https://github.com/chakra-ui/zag/commit/2a024fbd2e98343218d4d658e91f1d8c751e1a4d)]:
  - @zag-js/types@0.37.0
  - @zag-js/anatomy@0.37.0
  - @zag-js/core@0.37.0
  - @zag-js/utils@0.37.0
  - @zag-js/dom-query@0.37.0

## 0.36.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.3
  - @zag-js/core@0.36.3
  - @zag-js/types@0.36.3
  - @zag-js/utils@0.36.3
  - @zag-js/dom-query@0.36.3

## 0.36.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.2
  - @zag-js/core@0.36.2
  - @zag-js/types@0.36.2
  - @zag-js/utils@0.36.2
  - @zag-js/dom-query@0.36.2

## 0.36.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.1
  - @zag-js/core@0.36.1
  - @zag-js/types@0.36.1
  - @zag-js/utils@0.36.1
  - @zag-js/dom-query@0.36.1

## 0.36.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.0
  - @zag-js/core@0.36.0
  - @zag-js/types@0.36.0
  - @zag-js/utils@0.36.0
  - @zag-js/dom-query@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [[`0216161`](https://github.com/chakra-ui/zag/commit/0216161fd3d429409abc96941d33a0c333ef8d36)]:
  - @zag-js/core@0.35.0
  - @zag-js/anatomy@0.35.0
  - @zag-js/types@0.35.0
  - @zag-js/utils@0.35.0
  - @zag-js/dom-query@0.35.0

## 0.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.34.0
  - @zag-js/core@0.34.0
  - @zag-js/types@0.34.0
  - @zag-js/utils@0.34.0
  - @zag-js/dom-query@0.34.0

## 0.33.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.33.2
  - @zag-js/core@0.33.2
  - @zag-js/types@0.33.2
  - @zag-js/utils@0.33.2
  - @zag-js/dom-query@0.33.2

## 0.33.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.33.1
  - @zag-js/anatomy@0.33.1
  - @zag-js/types@0.33.1
  - @zag-js/utils@0.33.1
  - @zag-js/dom-query@0.33.1

## 0.33.0

### Patch Changes

- Updated dependencies [[`7872cdf`](https://github.com/chakra-ui/zag/commit/7872cdf8aeb28b9a30cd4a016bd12e5366054511)]:
  - @zag-js/core@0.33.0
  - @zag-js/anatomy@0.33.0
  - @zag-js/types@0.33.0
  - @zag-js/utils@0.33.0
  - @zag-js/dom-query@0.33.0

## 0.32.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.32.1
  - @zag-js/core@0.32.1
  - @zag-js/types@0.32.1
  - @zag-js/utils@0.32.1
  - @zag-js/dom-query@0.32.1

## 0.32.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.32.0
  - @zag-js/core@0.32.0
  - @zag-js/types@0.32.0
  - @zag-js/utils@0.32.0
  - @zag-js/dom-query@0.32.0

## 0.31.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.1
  - @zag-js/core@0.31.1
  - @zag-js/types@0.31.1
  - @zag-js/utils@0.31.1
  - @zag-js/dom-query@0.31.1

## 0.31.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.31.0
  - @zag-js/core@0.31.0
  - @zag-js/types@0.31.0
  - @zag-js/utils@0.31.0
  - @zag-js/dom-query@0.31.0

## 0.30.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.30.0
  - @zag-js/core@0.30.0
  - @zag-js/types@0.30.0
  - @zag-js/utils@0.30.0
  - @zag-js/dom-query@0.30.0

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

## 0.28.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.28.1
  - @zag-js/core@0.28.1
  - @zag-js/types@0.28.1
  - @zag-js/utils@0.28.1
  - @zag-js/dom-query@0.28.1

## 0.28.0

### Patch Changes

- Updated dependencies [[`e433b3ee`](https://github.com/chakra-ui/zag/commit/e433b3ee5b49a1099b8be2df99a4a5056fc1ecfd)]:
  - @zag-js/utils@0.28.0
  - @zag-js/core@0.28.0
  - @zag-js/anatomy@0.28.0
  - @zag-js/types@0.28.0
  - @zag-js/dom-query@0.28.0

## 0.27.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.27.1
  - @zag-js/core@0.27.1
  - @zag-js/types@0.27.1
  - @zag-js/utils@0.27.1
  - @zag-js/dom-query@0.27.1

## 0.27.0

### Patch Changes

- Updated dependencies [[`152b0a78`](https://github.com/chakra-ui/zag/commit/152b0a78b6ba18442f38164ce90789bc243f6e00)]:
  - @zag-js/core@0.27.0
  - @zag-js/anatomy@0.27.0
  - @zag-js/types@0.27.0
  - @zag-js/utils@0.27.0
  - @zag-js/dom-query@0.27.0

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

## 0.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.25.0
  - @zag-js/core@0.25.0
  - @zag-js/types@0.25.0
  - @zag-js/utils@0.25.0
  - @zag-js/dom-query@0.25.0

## 0.24.0

### Minor Changes

- [`29c47f9d`](https://github.com/chakra-ui/zag/commit/29c47f9d68906aaccbd2da3f274b74c2187ff257) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename component anatomy and parts
  - `getPageTriggerProps` => `getTriggerProps`
  - `getNextPageTriggerProps` => `getNextTriggerProps`
  - `getPrevPageTriggerProps` => `getPrevTriggerProps`

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.24.0
  - @zag-js/core@0.24.0
  - @zag-js/types@0.24.0
  - @zag-js/utils@0.24.0
  - @zag-js/dom-query@0.24.0

## 0.23.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.23.0
  - @zag-js/core@0.23.0
  - @zag-js/types@0.23.0
  - @zag-js/utils@0.23.0
  - @zag-js/dom-query@0.23.0

## 0.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.22.0
  - @zag-js/core@0.22.0
  - @zag-js/types@0.22.0
  - @zag-js/utils@0.22.0
  - @zag-js/dom-query@0.22.0

## 0.21.0

### Patch Changes

- [#873](https://github.com/chakra-ui/zag/pull/873)
  [`9db4e54b`](https://github.com/chakra-ui/zag/commit/9db4e54b7212d4ef575edaea3504d4b6b896aa17) Thanks
  [@srflp](https://github.com/srflp)! - Fix a bug where pagination does not return any pages.

- Updated dependencies []:
  - @zag-js/anatomy@0.21.0
  - @zag-js/core@0.21.0
  - @zag-js/types@0.21.0
  - @zag-js/utils@0.21.0
  - @zag-js/dom-query@0.21.0

## 0.20.0

### Minor Changes

- [#862](https://github.com/chakra-ui/zag/pull/862)
  [`9a3a82f0`](https://github.com/chakra-ui/zag/commit/9a3a82f0b3738beda59c313fafd51360e6b0322f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - BREAKING: Unify all callbacks to follow a consistent naming
  convention

### Patch Changes

- [#868](https://github.com/chakra-ui/zag/pull/868)
  [`eac4265e`](https://github.com/chakra-ui/zag/commit/eac4265e3e5ab5d3c99ecda721f1e356aef3e5ff) Thanks
  [@srflp](https://github.com/srflp)! - Invoke onChange after clicking on numbered pagination buttons

- [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Remove toggle machine

- Updated dependencies [[`9a3a82f0`](https://github.com/chakra-ui/zag/commit/9a3a82f0b3738beda59c313fafd51360e6b0322f),
  [`942db6ca`](https://github.com/chakra-ui/zag/commit/942db6caf9f699d6af56929c835b10ae80cfbc85)]:
  - @zag-js/types@0.20.0
  - @zag-js/anatomy@0.20.0
  - @zag-js/core@0.20.0
  - @zag-js/utils@0.20.0
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
  - @zag-js/dom-query@0.19.1

## 0.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.19.0
  - @zag-js/core@0.19.0
  - @zag-js/types@0.19.0
  - @zag-js/utils@0.19.0
  - @zag-js/dom-query@0.19.0

## 0.18.0

### Patch Changes

- Updated dependencies [[`224cbbb0`](https://github.com/chakra-ui/zag/commit/224cbbb02eef713d81acbee627dd9a0ed745c7fa)]:
  - @zag-js/utils@0.18.0
  - @zag-js/core@0.18.0
  - @zag-js/anatomy@0.18.0
  - @zag-js/types@0.18.0
  - @zag-js/dom-query@0.18.0

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

## 0.16.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.16.0
  - @zag-js/core@0.16.0
  - @zag-js/types@0.16.0
  - @zag-js/utils@0.16.0
  - @zag-js/dom-query@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.15.0
  - @zag-js/core@0.15.0
  - @zag-js/types@0.15.0
  - @zag-js/utils@0.15.0
  - @zag-js/dom-query@0.15.0

## 0.14.0

### Patch Changes

- Updated dependencies [[`7cf380b0`](https://github.com/chakra-ui/zag/commit/7cf380b0d3019507181b79e0fe99e894d9e83030)]:
  - @zag-js/dom-query@0.14.0
  - @zag-js/anatomy@0.14.0
  - @zag-js/core@0.14.0
  - @zag-js/types@0.14.0
  - @zag-js/utils@0.14.0

## 0.13.0

### Patch Changes

- Updated dependencies [[`4a2d8b77`](https://github.com/chakra-ui/zag/commit/4a2d8b77d1e71ad6b6c10134bc4186db6e6c0414)]:
  - @zag-js/core@0.13.0
  - @zag-js/anatomy@0.13.0
  - @zag-js/types@0.13.0
  - @zag-js/utils@0.13.0
  - @zag-js/dom-query@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.12.0
  - @zag-js/core@0.12.0
  - @zag-js/types@0.12.0
  - @zag-js/utils@0.12.0
  - @zag-js/dom-query@0.12.0

## 0.11.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.11.2
  - @zag-js/core@0.11.2
  - @zag-js/types@0.11.2
  - @zag-js/utils@0.11.2
  - @zag-js/dom-query@0.11.2

## 0.11.1

### Patch Changes

- [`aa30f407`](https://github.com/chakra-ui/zag/commit/aa30f40792cf5b953a99e7ce97e43fb0cbc4afa2) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix types exports

- Updated dependencies []:
  - @zag-js/anatomy@0.11.1
  - @zag-js/core@0.11.1
  - @zag-js/types@0.11.1
  - @zag-js/utils@0.11.1
  - @zag-js/dom-query@0.11.1

## 0.11.0

### Patch Changes

- [`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rebuild all packages using tsup

- Updated dependencies [[`4f371874`](https://github.com/chakra-ui/zag/commit/4f3718742dc88a2cd8726bdd889c9bbde94f5bce)]:
  - @zag-js/dom-query@0.11.0
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
  - @zag-js/dom-query@0.10.5

## 0.10.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.4
  - @zag-js/core@0.10.4
  - @zag-js/types@0.10.4
  - @zag-js/utils@0.10.4
  - @zag-js/dom-query@0.10.4

## 0.10.3

### Patch Changes

- [`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Use vite to build packages

- Updated dependencies [[`c59a8dec`](https://github.com/chakra-ui/zag/commit/c59a8dec15ab57d218823bfe7af6d723972be6c7),
  [`775f11c9`](https://github.com/chakra-ui/zag/commit/775f11c96759197fcbad14b5b8a0fbde095efc55)]:
  - @zag-js/anatomy@0.10.3
  - @zag-js/core@0.10.3
  - @zag-js/types@0.10.3
  - @zag-js/utils@0.10.3
  - @zag-js/dom-query@0.10.3

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.2
  - @zag-js/core@0.10.2
  - @zag-js/types@0.10.2
  - @zag-js/utils@0.10.2
  - @zag-js/dom-query@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.10.1
  - @zag-js/core@0.10.1
  - @zag-js/types@0.10.1
  - @zag-js/utils@0.10.1
  - @zag-js/dom-query@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`e8ac03ef`](https://github.com/chakra-ui/zag/commit/e8ac03ef4b820773a5875db861735e2aac8f29da),
  [`d2838286`](https://github.com/chakra-ui/zag/commit/d2838286fc13acae3f0818653d5feee982703f23),
  [`2a1fb4a0`](https://github.com/chakra-ui/zag/commit/2a1fb4a0740e6ad8e2902265e14597f087007675),
  [`a30258e8`](https://github.com/chakra-ui/zag/commit/a30258e8137bfba5811471919e463b79039848b6)]:
  - @zag-js/dom-query@0.10.0
  - @zag-js/anatomy@0.10.0
  - @zag-js/types@0.10.0
  - @zag-js/core@0.10.0
  - @zag-js/utils@0.10.0

## 0.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.9.2
  - @zag-js/core@0.9.2
  - @zag-js/types@0.9.2
  - @zag-js/utils@0.9.2
  - @zag-js/dom-query@0.9.2

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

## 0.9.0

### Patch Changes

- Updated dependencies [[`6274ed5e`](https://github.com/chakra-ui/zag/commit/6274ed5e460400ef7038d2b3b6c1f0ce679ca649)]:
  - @zag-js/anatomy@0.9.0

## 0.7.0

### Minor Changes

- [#627](https://github.com/chakra-ui/zag/pull/627)
  [`a3003490`](https://github.com/chakra-ui/zag/commit/a30034900cc891069027a07d0b1ee45f41277f27) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Add `type` property to the pagination's context to control properties
  used in trigger elements

### Patch Changes

- Updated dependencies [[`413cdf18`](https://github.com/chakra-ui/zag/commit/413cdf180f718469c9c8b879a43aa4501d1ae59c)]:
  - @zag-js/core@0.7.0

## 0.5.0

### Patch Changes

- Updated dependencies [[`ec07ff35`](https://github.com/chakra-ui/zag/commit/ec07ff3590916ebcb4450b64207370ee2af9d3d1),
  [`54377b1c`](https://github.com/chakra-ui/zag/commit/54377b1c4ed85deb06453a00648b7c2c1f0c72df)]:
  - @zag-js/core@0.5.0
  - @zag-js/types@0.5.0

## 0.1.16

### Patch Changes

- Updated dependencies [[`30dbeb28`](https://github.com/chakra-ui/zag/commit/30dbeb282f7901c33518097a0e1dd9a857f7efb0)]:
  - @zag-js/utils@0.3.4
  - @zag-js/core@0.2.12

## 0.1.15

### Patch Changes

- Updated dependencies [[`1e10b1f4`](https://github.com/chakra-ui/zag/commit/1e10b1f40016f5c9bdf0924a3470b9383c0dbce2)]:
  - @zag-js/core@0.2.11

## 0.1.14

### Patch Changes

- Updated dependencies [[`1446d88b`](https://github.com/chakra-ui/zag/commit/1446d88bff3848f2a2ec0a793ee83281cda966e8)]:
  - @zag-js/dom-query@0.1.4

## 0.1.13

### Patch Changes

- [`135f365b`](https://github.com/chakra-ui/zag/commit/135f365b12ac1d59d6f85f31fdcb6a11c091a324) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `vitest` was bundled in `dist` due to incorrect
  structure

## 0.1.12

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.

- Updated dependencies [[`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99)]:
  - @zag-js/dom-query@0.1.3
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

## 0.1.5

### Patch Changes

- Updated dependencies [[`5bd24f02`](https://github.com/chakra-ui/zag/commit/5bd24f02fcab355f7df8a2d5cea3b155155380f8)]:
  - @zag-js/anatomy@0.1.2

## 0.1.4

### Patch Changes

- [`af4ab9bb`](https://github.com/chakra-ui/zag/commit/af4ab9bb7cd599c53e47ca7ed2ea90a4ff742499) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Update anatomy of components

- Updated dependencies [[`9d936614`](https://github.com/chakra-ui/zag/commit/9d93661439f10a550c154e9f290905d32e8f509b)]:
  - @zag-js/core@0.2.3

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

## 0.1.1

### Patch Changes

- [#381](https://github.com/chakra-ui/zag/pull/381)
  [`21775db5`](https://github.com/chakra-ui/zag/commit/21775db5ac318b095f603e7030ec7645e104f663) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Omit undefined values passed in machine's context

- Updated dependencies [[`4aa6955f`](https://github.com/chakra-ui/zag/commit/4aa6955fab7ff6fee8545dcf491576640c69c64e)]:
  - @zag-js/core@0.2.1

## 0.1.0

### Minor Changes

- [#375](https://github.com/chakra-ui/zag/pull/375)
  [`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca) Thanks
  [@darrylblake](https://github.com/darrylblake)! - Ensures code is transpiled with `es2019` target for environments
  that don't support `es2020` and up, i.e. Cypress.

### Patch Changes

- Updated dependencies [[`9cb4e9de`](https://github.com/chakra-ui/zag/commit/9cb4e9de28a3c6666860bc068c86be67a3b1a2ca)]:
  - @zag-js/core@0.2.0
  - @zag-js/types@0.3.0

## 0.0.1

### Patch Changes

- [#334](https://github.com/chakra-ui/zag/pull/334)
  [`f81422e8`](https://github.com/chakra-ui/zag/commit/f81422e8bd6845cb2778eb4106a24a1f9ce1685a) Thanks
  [@anubra266](https://github.com/anubra266)! - Renamed `messages` to `translations`

- [#326](https://github.com/chakra-ui/zag/pull/326)
  [`e3873687`](https://github.com/chakra-ui/zag/commit/e3873687b7d3212f75ea39c67b15b0cfd9b425b8) Thanks
  [@anubra266](https://github.com/anubra266)! - Add `pagination` machine

- [`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Force new release

- [#328](https://github.com/chakra-ui/zag/pull/328)
  [`0139c401`](https://github.com/chakra-ui/zag/commit/0139c401876f7bb070c6eddb9de44fdd4636b672) Thanks
  [@anubra266](https://github.com/anubra266)! - - Added `pageSize` to `onChange` event

- Updated dependencies [[`52552156`](https://github.com/chakra-ui/zag/commit/52552156ded1b00f873576f52b11d0414f5dfee7)]:
  - @zag-js/core@0.1.12
  - @zag-js/types@0.2.7
