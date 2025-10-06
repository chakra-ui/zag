import { createComputed, createRoot, createSignal, mergeProps as _mergeProps } from "solid-js"
import { mergeProps } from "../src"

describe("mergeProps", () => {
  it("handles one argument", () =>
    createRoot((dispose) => {
      const onClick = () => {}
      const className = "primary"
      const id = "test_id"

      const props = mergeProps({ onClick, className, id })

      expect(props.onClick).toBe(onClick)
      expect(props.className).toBe(className)
      expect(props.id).toBe(id)

      dispose()
    }))

  it("combines handlers", async () => {
    createRoot(async (dispose) => {
      let count = 0

      const mockFn = vi.fn(() => {
        count++
      })

      const props = mergeProps({ onClick: mockFn }, { onClick: mockFn }, { onClick: mockFn })

      props.onClick()
      expect(mockFn).toBeCalledTimes(3)
      expect(count).toBe(3)

      dispose()
    })
  })

  it("combines css classes", async () => {
    createRoot(async (dispose) => {
      const className1 = "primary"
      const className2 = "hover"
      const className3 = "focus"

      const props = mergeProps({ class: className1 }, { class: className2 }, { class: className3 })
      expect(props.class).toBe("primary hover focus")

      const props2 = mergeProps({ className: className1 }, { className: className2 }, { className: className3 })
      expect(props2.className).toBe("primary hover focus")

      dispose()
    })
  })

  it("combines styles", () =>
    createRoot((dispose) => {
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

      dispose()
    }))

  it("accepts function sources", () => {
    createRoot(() => {
      const [signal, setSignal] = createSignal<any>({
        class: "primary",
        style: {
          margin: "10px",
        },
      })

      const props = mergeProps(
        signal,
        { class: "secondary" },
        {
          style: { padding: "10px" },
        },
      )

      let i = 0

      createComputed(() => {
        if (i === 0) {
          expect(props.class).toBe("primary secondary")
          expect(props.style).toEqual({ margin: "10px", padding: "10px" })
          i++
        } else {
          expect(props.class).toBe("tertiary secondary")
          expect(props.style).toEqual({ padding: "10px" })
          // expect(props.foo).toEqual("bar")
        }
      })

      setSignal({ class: "tertiary", foo: "bar" })
    })
  })

  it("last value overwrites the event-listeners", async () => {
    createRoot(async (dispose) => {
      const mockFn = vi.fn()
      const message1 = "click1"
      const message2 = "click2"

      const props = mergeProps(
        { onEvent: () => mockFn(message1) },
        { onEvent: () => mockFn(message2) },
        { onEvent: "overwrites" },
      )

      expect(props.onEvent).toBe("overwrites")

      dispose()
    })
  })

  it("works with mergeProps", () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const combined = mergeProps({ onClick: cb1 }, { onClick: cb2 })
    const merged = _mergeProps(combined)

    merged.onClick("foo")

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb1).toBeCalledWith("foo")
    expect(cb2).toHaveBeenCalledTimes(1)
    expect(cb2).toBeCalledWith("foo")
  })

  it("merges function source with override object", () => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal("initial")

      const baseProps = () => ({
        id: "base",
        value: value(),
        class: "base-class",
        onClick: vi.fn(),
      })

      const overrideProps = {
        class: "override-class",
        disabled: true,
      }

      const merged = mergeProps(baseProps, overrideProps)

      // Initial state
      expect(merged.id).toBe("base")
      expect(merged.value).toBe("initial")
      expect(merged.class).toBe("base-class override-class")
      expect(merged.disabled).toBe(true)
      expect(typeof merged.onClick).toBe("function")

      // Update signal and check reactivity
      setValue("updated")
      expect(merged.value).toBe("updated")
      expect(merged.class).toBe("base-class override-class")

      dispose()
    })
  })
})
