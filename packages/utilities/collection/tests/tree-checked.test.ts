import { createTreeCollection } from "../src"
import { getTreeCheckedStates, toggleTreeChecked } from "../src/tree/checked"
interface Node {
  value: string
  children?: Node[] | undefined
  childrenCount?: number | undefined
}

const tree = createTreeCollection<Node>({
  rootNode: {
    value: "ROOT",
    children: [
      {
        value: "src",
        children: [{ value: "a.ts" }, { value: "b.ts" }, { value: "lib", children: [{ value: "c.ts" }] }],
      },
      { value: "readme" },
      { value: "lazy", childrenCount: 2 },
    ],
  },
})

const states = (checked: string[]) => Object.fromEntries(getTreeCheckedStates(tree, checked))

describe("tree checked / states", () => {
  test("nothing checked", () => {
    expect(states([])).toEqual({
      src: false,
      "a.ts": false,
      "b.ts": false,
      lib: false,
      "c.ts": false,
      readme: false,
      lazy: false,
    })
  })

  test("a branch is indeterminate while only some of its leaves are checked", () => {
    const result = states(["a.ts"])
    expect(result.src).toBe("indeterminate")
    expect(result.lib).toBe(false)
  })

  test("a branch is checked when every leaf under it is, at any depth", () => {
    const result = states(["a.ts", "b.ts", "c.ts"])
    expect(result.src).toBe(true)
    expect(result.lib).toBe(true)
  })

  test("a branch whose children haven't loaded stays unchecked", () => {
    expect(states(["lazy"]).lazy).toBe(false)
    expect(states(["a.ts", "b.ts", "c.ts", "readme"]).lazy).toBe(false)
  })

  test("a leaf reflects its own membership", () => {
    expect(states(["readme"]).readme).toBe(true)
    expect(states(["a.ts"]).readme).toBe(false)
  })

  test("values not in the tree are ignored", () => {
    expect(states(["missing"]).src).toBe(false)
  })
})

describe("tree checked / toggle", () => {
  test("toggles a leaf", () => {
    expect(toggleTreeChecked(tree, [], "readme")).toEqual(["readme"])
    expect(toggleTreeChecked(tree, ["readme"], "readme")).toEqual([])
  })

  test("checks every leaf of a branch that isn't fully checked", () => {
    expect(toggleTreeChecked(tree, ["a.ts"], "src")).toEqual(["a.ts", "b.ts", "c.ts"])
  })

  test("unchecks every leaf of a fully checked branch, keeping the rest", () => {
    expect(toggleTreeChecked(tree, ["readme", "a.ts", "b.ts", "c.ts"], "src")).toEqual(["readme"])
  })

  test("a branch without loaded children changes nothing", () => {
    expect(toggleTreeChecked(tree, ["readme"], "lazy")).toEqual(["readme"])
  })
})
