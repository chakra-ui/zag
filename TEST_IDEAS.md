```jsx
// react/test/toggle.test.ts
import { toggle } from "@ui-machines/test"
import { render } from "@testing-library/react"
import { Toggle } from "../Toggle"

test(() => {
  const tools = render(<Toggle />)
  toggle.testAttributes(tools)
})

test(() => {
  const tools = render(<Toggle />)
  toggle.testToggleInteraction(tools)
})

// @ui-machines/test/src/toggle.ts
const toggle = {
  testAttributes(tools) {
    const btn = tools.findByTestId("btn")
    tools.fireEvent.click(btn)
    expect(btn).toHaveFocus()
  },
}
```
