import { mergeProps } from "../src"

describe("mergeProps", () => {
  it("handles one argument", () => {
    const onClick = () => {}
    const className = "primary"
    const id = "test_id"

    const props = mergeProps({ onClick, className, id })

    expect(props.onClick).toBe(onClick)
    expect(props.className).toBe(className)
    expect(props.id).toBe(id)
  })

  it("combines handlers with @ prefix", () => {
    let count = 0

    const mockFn = vi.fn(() => {
      count++
    })

    const props = mergeProps({ "@click": mockFn }, { "@click": mockFn }, { "@click": mockFn })

    props["@click"]()
    expect(mockFn).toBeCalledTimes(3)
    expect(count).toBe(3)
  })

  it("combines css classes", () => {
    const className1 = "primary"
    const className2 = "hover"
    const className3 = "focus"

    const props = mergeProps({ class: className1 }, { class: className2 }, { class: className3 })
    expect(props.class).toBe("primary hover focus")

    const props2 = mergeProps({ className: className1 }, { className: className2 }, { className: className3 })
    expect(props2.className).toBe("primary hover focus")
  })

  it("combines styles", () => {
    const stringStyles = `
      margin: 24px;
      padding: 2;
      background-image: url("http://example.com/image.png");
      border: 1px solid #123456;
      --x: 123;
    `

    const objStyles = {
      margin: "10px",
      "font-size": "2rem",
    }

    const props = mergeProps({ style: stringStyles }, { style: objStyles })

    expect(props.style).toMatchInlineSnapshot(`
      {
        "--x": "123",
        "background-image": "url("http://example.com/image.png")",
        "border": "1px solid #123456",
        "font-size": "2rem",
        "margin": "10px",
        "padding": "2",
      }
    `)
  })

  it("handles Lit @ event prefix", () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()

    const props = mergeProps({ "@click": mockFn1 }, { "@click": mockFn2 })

    props["@click"]("test")
    expect(mockFn1).toBeCalledWith("test")
    expect(mockFn2).toBeCalledWith("test")
  })

  it("last value overwrites the event-listeners", () => {
    const mockFn = vi.fn()
    const message1 = "click1"
    const message2 = "click2"

    const props = mergeProps(
      { "@event": () => mockFn(message1) },
      { "@event": () => mockFn(message2) },
      { "@event": "overwrites" },
    )

    expect(props["@event"]).toBe("overwrites")
  })
})
