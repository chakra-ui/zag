import { createTreeCollection } from "@zag-js/collection"
import { createTreeState } from "../src/utils/tree-state"

function createTree() {
  return createTreeCollection({
    rootNode: { value: "root", children: [{ value: "branch", children: [{ value: "leaf" }] }] },
  })
}

describe("tree derived state", () => {
  it("reuses checked states across focus, expansion, and selection-only reads", () => {
    const tree = createTree()
    const state = createTreeState()
    const checked = state.checked(tree, ["leaf"])
    expect(checked.get("branch")).toBe(true)
    state.selected(["branch"])
    state.expanded(["branch"])
    state.visible(tree, ["branch"])
    expect(state.checked(tree, ["leaf"])).toBe(checked)
    expect(state.checked(tree, [])).not.toBe(checked)
    expect(state.checked(tree, []).get("branch")).toBe(false)
  })

  it("invalidates checked states on structural edits, including loaded children", () => {
    const tree = createTree()
    const state = createTreeState()
    const checked = state.checked(tree, ["leaf"])
    const next = tree.replace([0], { value: "branch", children: [{ value: "loaded" }] })
    const result = state.checked(next, ["leaf"])
    expect(result).not.toBe(checked)
    expect(result.get("branch")).toBe(false)
    expect(result.has("loaded")).toBe(true)
  })

  it("keeps caches independent and detects edits to supplied arrays", () => {
    const tree = createTree()
    const state = createTreeState()
    const values = ["leaf"]
    const checked = state.checked(tree, values)
    const selected = state.selected(values)
    const expanded = state.expanded(values)
    values[0] = "branch"
    expect(state.checked(tree, values)).not.toBe(checked)
    expect(state.selected(values)).not.toBe(selected)
    expect(state.expanded(values)).not.toBe(expanded)
    expect(selected.has("leaf")).toBe(true)
    expect(state.selected(values).has("branch")).toBe(true)
    expect(createTreeState().checked(tree, values)).not.toBe(state.checked(tree, values))
  })
})
