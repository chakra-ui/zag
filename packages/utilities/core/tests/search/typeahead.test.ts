import { describe, expect, test } from "vitest"
import { createTypeaheadState, typeahead } from "../../src/search"

const items = ["Apple", "Apricot", "Banana", "Éditer", "Blueberry", "Cherry"]

function setup(activeIndex = -1) {
  const state = createTypeaheadState()
  let active = activeIndex
  const type = (key: string) => {
    const item = typeahead({ state, key, items, activeIndex: active, itemToString: (item) => item })
    if (item) active = items.indexOf(item)
    return item
  }
  return { state, type }
}

describe("typeahead", () => {
  test("matches the start of an item, ignoring case and accents", () => {
    expect(setup().type("b")).toBe("Banana")
    expect(setup().type("E")).toBe("Éditer")
  })

  test("keeps the active item while the query still matches it", () => {
    const { type } = setup()
    expect(type("a")).toBe("Apple")
    expect(type("p")).toBe("Apple")
    expect(type("r")).toBe("Apricot")
  })

  test("cycles through matches when one key is repeated", () => {
    const { type } = setup()
    expect(type("b")).toBe("Banana")
    expect(type("b")).toBe("Blueberry")
    expect(type("b")).toBe("Banana")
  })

  test("starts after the active item and wraps", () => {
    expect(setup(5).type("a")).toBe("Apple")
    expect(setup(0).type("a")).toBe("Apricot")
  })

  test("skips disabled items", () => {
    const state = createTypeaheadState()
    const item = typeahead({
      state,
      key: "a",
      items,
      activeIndex: -1,
      itemToString: (item) => item,
      isItemDisabled: (item) => item === "Apple",
    })
    expect(item).toBe("Apricot")
  })

  test("resets the typed keys after the timeout", async () => {
    const state = createTypeaheadState()
    typeahead({ state, key: "a", items, activeIndex: -1, itemToString: (item) => item, timeout: 10 })
    expect(state.keysSoFar).toBe("a")
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(state.keysSoFar).toBe("")
  })
})
