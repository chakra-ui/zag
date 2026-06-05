---
"@zag-js/popover": major
---

**Breaking:** Remove the `portalled` prop and the `api.portalled` value.

The popover now auto-detects whether its content is portalled (rendered outside the trigger's DOM subtree) and proxies
tab order accordingly — so forgetting to set `portalled` can no longer break keyboard accessibility. Decide portalling
purely by where you render the content:

```diff
- const service = useMachine(popover.machine, { id, portalled: true })
- const api = popover.connect(service, normalizeProps)
- const Wrapper = api.portalled ? Portal : Fragment
- <Wrapper>
+ <Portal>
    <div {...api.getPositionerProps()}>...</div>
- </Wrapper>
+ </Portal>
```

To render inline, drop the `Portal` wrapper (previously `portalled: false`); tab order is still handled automatically.
