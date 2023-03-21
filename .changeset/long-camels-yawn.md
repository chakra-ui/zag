---
"@zag-js/tabbable": minor
---

Add `proxyTabFocus` helper to manage focus within a portal.

This helper will listen to tab key events and manage focus between the container, reference and the next tabbble element
in DOM sequence.

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
