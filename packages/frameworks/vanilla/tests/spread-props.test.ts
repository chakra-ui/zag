import { spreadProps } from "../src"

describe("spreadProps", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe("attribute setting", () => {
    test("sets attributes on element", () => {
      const div = document.createElement("div")
      spreadProps(div, {
        id: "test-id",
        title: "test-title",
        "data-testid": "test",
      })

      expect(div.getAttribute("id")).toBe("test-id")
      expect(div.getAttribute("title")).toBe("test-title")
      expect(div.getAttribute("data-testid")).toBe("test")
    })

    test("lowercases attribute names", () => {
      const div = document.createElement("div")
      spreadProps(div, {
        dataValue: "123",
        ariaLabel: "label",
      })

      expect(div.getAttribute("datavalue")).toBe("123")
      expect(div.getAttribute("arialabel")).toBe("label")
    })
  })

  describe("attribute removal", () => {
    test("removes attributes when null", () => {
      const div = document.createElement("div")
      div.setAttribute("title", "old-title")

      spreadProps(div, { title: "new-title" })
      expect(div.getAttribute("title")).toBe("new-title")

      spreadProps(div, { title: null })
      expect(div.hasAttribute("title")).toBe(false)
    })

    test("removes attributes when undefined", () => {
      const div = document.createElement("div")
      div.setAttribute("title", "old-title")

      spreadProps(div, { title: "new-title" })
      spreadProps(div, { title: undefined })

      expect(div.hasAttribute("title")).toBe(false)
    })

    test("removes old attributes not in new props", () => {
      const div = document.createElement("div")

      spreadProps(div, { id: "test", title: "hello" })
      expect(div.getAttribute("title")).toBe("hello")

      spreadProps(div, { id: "test" })
      expect(div.hasAttribute("title")).toBe(false)
    })
  })

  describe("event listeners", () => {
    test("adds event handlers", () => {
      const div = document.createElement("div")
      const onClick = vi.fn()

      spreadProps(div, { onclick: onClick })
      div.click()

      expect(onClick).toHaveBeenCalledOnce()
    })

    test("removes old event handlers on update", () => {
      const div = document.createElement("div")
      const oldClick = vi.fn()
      const newClick = vi.fn()

      spreadProps(div, { onclick: oldClick })
      spreadProps(div, { onclick: newClick })

      div.click()

      expect(oldClick).not.toHaveBeenCalled()
      expect(newClick).toHaveBeenCalledOnce()
    })

    test("cleanup function removes event handlers", () => {
      const div = document.createElement("div")
      const onClick = vi.fn()

      const cleanup = spreadProps(div, { onclick: onClick })
      cleanup()

      div.click()

      expect(onClick).not.toHaveBeenCalled()
    })

    test("handles multiple event types", () => {
      const div = document.createElement("div")
      const onClick = vi.fn()
      const onMouseEnter = vi.fn()

      spreadProps(div, {
        onclick: onClick,
        onmouseenter: onMouseEnter,
      })

      div.click()
      div.dispatchEvent(new MouseEvent("mouseenter"))

      expect(onClick).toHaveBeenCalledOnce()
      expect(onMouseEnter).toHaveBeenCalledOnce()
    })
  })

  describe("DOM properties", () => {
    test("sets value as property on input", () => {
      const input = document.createElement("input")
      spreadProps(input, { value: "test-value" })

      expect(input.value).toBe("test-value")
    })

    test("sets checked as property on checkbox", () => {
      const input = document.createElement("input")
      input.type = "checkbox"

      spreadProps(input, { checked: true })
      expect(input.checked).toBe(true)
    })

    test("checked: false sets the property to empty string", () => {
      const input = document.createElement("input")
      input.type = "checkbox"
      input.checked = true

      // checked is in assignableProps, so it sets the property directly
      spreadProps(input, { checked: false })
      // false gets converted to empty string for DOM properties
      expect(input.checked).toBe(false)
    })

    test("sets selected as property on option", () => {
      const option = document.createElement("option")

      spreadProps(option, { selected: true })
      expect(option.selected).toBe(true)

      spreadProps(option, { selected: false })
      expect(option.selected).toBe(false)
    })

    test("clears DOM properties when removed from attrs", () => {
      const input = document.createElement("input")
      spreadProps(input, { value: "test" })
      expect(input.value).toBe("test")

      spreadProps(input, {})
      expect(input.value).toBe("")
    })

    test("clears class property when removed from attrs", () => {
      const div = document.createElement("div")
      spreadProps(div, { class: "active" })
      expect(div.className).toBe("active")

      spreadProps(div, {})
      expect(div.className).toBe("")
    })
  })

  describe("reconciliation", () => {
    test("only updates changed attributes", () => {
      const div = document.createElement("div")

      // First spread
      spreadProps(div, {
        id: "test",
        title: "hello",
        "data-count": "1",
      })

      // Spy on setAttribute
      const setAttributeSpy = vi.spyOn(div, "setAttribute")

      // Second spread with same id and title, different data-count
      spreadProps(div, {
        id: "test",
        title: "hello",
        "data-count": "2",
      })

      // Only data-count should be updated
      expect(setAttributeSpy).toHaveBeenCalledWith("data-count", "2")
      expect(setAttributeSpy).not.toHaveBeenCalledWith("id", "test")
      expect(setAttributeSpy).not.toHaveBeenCalledWith("title", "hello")
    })
  })

  describe("boolean attributes", () => {
    test("sets truthy boolean as attribute", () => {
      const button = document.createElement("button")
      spreadProps(button, { disabled: true })

      expect(button.hasAttribute("disabled")).toBe(true)
    })

    test("removes falsy boolean attribute", () => {
      const button = document.createElement("button")
      button.setAttribute("disabled", "")

      spreadProps(button, { disabled: false })

      expect(button.hasAttribute("disabled")).toBe(false)
    })
  })

  describe("SVG support", () => {
    test("preserves viewBox case for SVG elements", () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      spreadProps(svg, { viewBox: "0 0 100 100" })

      expect(svg.getAttribute("viewBox")).toBe("0 0 100 100")
    })

    test("preserves preserveAspectRatio case for SVG elements", () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      spreadProps(svg, { preserveAspectRatio: "xMidYMid" })

      expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid")
    })

    test("handles SVG child elements", () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      svg.appendChild(rect)

      spreadProps(rect, {
        width: "100",
        height: "50",
      })

      expect(rect.getAttribute("width")).toBe("100")
      expect(rect.getAttribute("height")).toBe("50")
    })
  })

  describe("style attribute", () => {
    test("sets style string", () => {
      const div = document.createElement("div")
      spreadProps(div, { style: "color:red;font-size:16px;" })

      expect(div.getAttribute("style")).toBe("color:red;font-size:16px;")
    })
  })
})
