---
"@zag-js/popover": major
---

**Breaking:** Removed the `portalled` prop and `api.portalled`. The popover detects whether its content is portalled and
handles tab order either way, so portal the content or render it inline as you like.

```diff
- const Wrapper = api.portalled ? Portal : Fragment
- <Wrapper>
+ <Portal>
    <div {...api.getPositionerProps()}>...</div>
- </Wrapper>
+ </Portal>
```
