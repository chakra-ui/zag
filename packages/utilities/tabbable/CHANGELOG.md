# @zag-js/tabbable

## 0.1.0

### Minor Changes

- [`316eea98`](https://github.com/chakra-ui/zag/commit/316eea980af3a276ec3b0bd900b9e705f59f7c35) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `proxyTabFocus` helper to manage focus within a portal.

  This helper will listen to tab key events and manage focus between the container, reference and the next tabbble
  element in DOM sequence.

  ```js
  import { proxyTabFocus } from "@zag-js/tabbable"

  export function App() {
    const referenceRef = useRef()
    const containerRef = useRef()

    useEffect(() => {
      const focusElement = (el) => el.focus({ preventScroll: true })
      return proxyTabFocus(containerRef.current, referenceRef.current, focusElement)
    }, [])

    return (
      <div>
        <button ref={referenceRef}>Click me</button>
        <Portal>
          <div ref={containerRef}>
            <button>First</button>
            <button>Last</button>
          </div>
        </Portal>
        <button>Outside</button>
      </div>
    )
  }
  ```

  Add `getTabbableEdges` helper to get the first and last tabbable elements

## 0.0.1

### Patch Changes

- [#536](https://github.com/chakra-ui/zag/pull/536)
  [`aabc9aed`](https://github.com/chakra-ui/zag/commit/aabc9aed93ae3f49e2cec8d8b28edd23a337ce99) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor all packages to have proper dependency structure and
  bundle size.
