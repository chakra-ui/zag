import { bindable } from "../src/bindable"
import { createRefs } from "../src/refs"

describe("bindable", () => {
  describe("default value", () => {
    test("initializes with defaultValue", () => {
      const state = bindable(() => ({ defaultValue: "hello" }))
      expect(state.get()).toBe("hello")
      expect(state.initial).toBe("hello")
    })

    test("initializes with value over defaultValue", () => {
      const state = bindable(() => ({
        defaultValue: "default",
        value: "controlled",
      }))
      expect(state.get()).toBe("controlled")
    })
  })

  describe("get/set", () => {
    test("updates value with set", () => {
      const state = bindable(() => ({ defaultValue: "initial" }))

      state.set("updated")
      expect(state.get()).toBe("updated")
    })

    test("set with function receives previous value", () => {
      const state = bindable(() => ({ defaultValue: 5 }))

      state.set((prev) => prev + 10)
      expect(state.get()).toBe(15)
    })

    test("multiple updates", () => {
      const state = bindable(() => ({ defaultValue: 0 }))

      state.set(1)
      state.set(2)
      state.set(3)

      expect(state.get()).toBe(3)
    })
  })

  describe("controlled mode", () => {
    test("respects external value prop", () => {
      let externalValue = "controlled"

      const state = bindable(() => ({
        defaultValue: "default",
        value: externalValue,
      }))

      expect(state.get()).toBe("controlled")

      // Attempting to set should not change the returned value
      state.set("new-value")
      expect(state.get()).toBe("controlled")
    })

    test("switches between controlled and uncontrolled", () => {
      let controlledValue: string | undefined = undefined

      const state = bindable(() => ({
        defaultValue: "default",
        value: controlledValue,
      }))

      // Initially uncontrolled
      expect(state.get()).toBe("default")

      state.set("updated")
      expect(state.get()).toBe("updated")
    })
  })

  describe("onChange callback", () => {
    test("fires on value change", () => {
      const onChange = vi.fn()

      const state = bindable(() => ({
        defaultValue: "initial",
        onChange,
      }))

      state.set("new-value")

      expect(onChange).toHaveBeenCalledWith("new-value", "initial")
    })

    test("does not fire when value is same", () => {
      const onChange = vi.fn()

      const state = bindable(() => ({
        defaultValue: "same",
        onChange,
      }))

      state.set("same")

      expect(onChange).not.toHaveBeenCalled()
    })

    test("fires on invoke", () => {
      const onChange = vi.fn()

      const state = bindable(() => ({
        defaultValue: "initial",
        onChange,
      }))

      state.invoke("next", "prev")

      expect(onChange).toHaveBeenCalledWith("next", "prev")
    })
  })

  describe("isEqual", () => {
    test("uses custom equality function", () => {
      const onChange = vi.fn()

      const state = bindable(() => ({
        defaultValue: { id: 1, name: "test" },
        isEqual: (a, b) => a.id === b?.id,
        onChange,
      }))

      // Same id, different name - should be considered equal
      state.set({ id: 1, name: "different" })

      expect(onChange).not.toHaveBeenCalled()
    })

    test("default equality uses Object.is", () => {
      const onChange = vi.fn()

      const state = bindable(() => ({
        defaultValue: { id: 1 },
        onChange,
      }))

      // Different object reference
      state.set({ id: 1 })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe("hash", () => {
    test("returns string representation by default", () => {
      const state = bindable(() => ({ defaultValue: 123 }))
      expect(state.hash(123)).toBe("123")
    })

    test("uses custom hash function", () => {
      const state = bindable(() => ({
        defaultValue: { id: 1, name: "test" },
        hash: (value) => `item-${value.id}`,
      }))

      expect(state.hash({ id: 42, name: "test" })).toBe("item-42")
    })
  })

  describe("ref property", () => {
    test("exposes ref with value", () => {
      const state = bindable(() => ({ defaultValue: "test" }))

      expect(state.ref).toBeDefined()
      expect(state.ref.value).toBe("test")
    })

    test("ref updates on set", () => {
      const state = bindable(() => ({ defaultValue: "initial" }))

      state.set("updated")

      expect(state.ref.value).toBe("updated")
    })
  })
})

describe("bindable.cleanup", () => {
  test("is a no-op function", () => {
    const fn = vi.fn()

    // Should not throw
    expect(() => bindable.cleanup(fn)).not.toThrow()

    // Function should not be called
    expect(fn).not.toHaveBeenCalled()
  })
})

describe("bindable.ref", () => {
  test("creates simple ref with default value", () => {
    const ref = bindable.ref("initial")

    expect(ref.get()).toBe("initial")
  })

  test("get and set work correctly", () => {
    const ref = bindable.ref(0)

    ref.set(42)
    expect(ref.get()).toBe(42)

    ref.set(100)
    expect(ref.get()).toBe(100)
  })

  test("works with objects", () => {
    const ref = bindable.ref({ count: 0 })

    expect(ref.get()).toEqual({ count: 0 })

    ref.set({ count: 5 })
    expect(ref.get()).toEqual({ count: 5 })
  })
})

describe("createRefs", () => {
  test("creates refs from object", () => {
    const refs = createRefs({
      inputEl: null as HTMLInputElement | null,
      count: 0,
    })

    expect(refs.get("inputEl")).toBeNull()
    expect(refs.get("count")).toBe(0)
  })

  test("get returns current value", () => {
    const refs = createRefs({
      value: "initial",
    })

    expect(refs.get("value")).toBe("initial")
  })

  test("set updates value", () => {
    const refs = createRefs({
      value: "initial",
    })

    refs.set("value", "updated")

    expect(refs.get("value")).toBe("updated")
  })

  test("handles multiple refs", () => {
    const refs = createRefs({
      name: "test",
      count: 0,
      enabled: true,
    })

    refs.set("name", "new-name")
    refs.set("count", 42)
    refs.set("enabled", false)

    expect(refs.get("name")).toBe("new-name")
    expect(refs.get("count")).toBe(42)
    expect(refs.get("enabled")).toBe(false)
  })

  test("works with DOM element refs", () => {
    const div = document.createElement("div")

    const refs = createRefs({
      containerEl: null as HTMLElement | null,
    })

    refs.set("containerEl", div)

    expect(refs.get("containerEl")).toBe(div)
  })
})
