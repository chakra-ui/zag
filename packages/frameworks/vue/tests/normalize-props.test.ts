import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { normalizeProps } from "../src"

describe("normalizeProps / style", () => {
  test("writes vendor-prefixed style keys with a leading dash", () => {
    const props = normalizeProps.element({
      style: { WebkitUserSelect: "none", MozAppearance: "textfield", msTouchAction: "none", userSelect: "none" },
    })
    expect(props.style).toEqual({
      "-webkit-user-select": "none",
      "-moz-appearance": "textfield",
      "-ms-touch-action": "none",
      userSelect: "none",
    })
  })

  test("renders vendor-prefixed styles on the server", async () => {
    const props = normalizeProps.element({ style: { WebkitTouchCallout: "none", userSelect: "none" } })
    const html = await renderToString(createSSRApp({ render: () => h("div", props as Record<string, unknown>) }))
    expect(html).toBe('<div style="-webkit-touch-callout:none;user-select:none;"></div>')
  })
})
