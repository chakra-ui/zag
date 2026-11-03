import { render } from "@solidjs/testing-library"
import { normalizeProps } from "../src/normalize-props"

test("renders boolean ARIA values as strings", () => {
  const { getByRole } = render(() => (
    <button {...normalizeProps.element({ "aria-expanded": false, "aria-selected": true })}>Trigger</button>
  ))
  const button = getByRole("button")

  expect(button.getAttribute("aria-expanded")).toBe("false")
  expect(button.getAttribute("aria-selected")).toBe("true")
})
