import { ListCollection, Selection } from "../src"

const collection = new ListCollection({
  items: [
    { id: "1", value: "1" },
    { id: "2", value: "2" },
    { id: "3", value: "3" },
    { id: "4", value: "4" },
    { id: "5", value: "5" },
    { id: "6", value: "6" },
  ],
})

describe("Selection", () => {
  it("extend / include", () => {
    let sel = new Selection(["1"])
    sel.selectionMode = "multiple"
    expect(sel.extendSelection(collection, "1", "2")).toMatchInlineSnapshot(`
      Set {
        "1",
        "2",
      }
    `)
  })

  it("extend / include / reverse", () => {
    let sel = new Selection([])
    sel.selectionMode = "multiple"
    expect(sel.extendSelection(collection, "5", "3")).toMatchInlineSnapshot(`
      Set {
        "3",
        "4",
        "5",
      }
    `)
  })

  it("extend / toggle", () => {
    let sel = new Selection(["1", "2", "3"])
    sel.selectionMode = "multiple"
    expect(sel.extendSelection(collection, "3", "2")).toMatchInlineSnapshot(`
      Set {
        "1",
        "2",
        "3",
      }
    `)
  })

  it("select", () => {
    let sel = new Selection()
    sel.selectionMode = "multiple"
    expect(sel.select(collection, "1").select(collection, "2")).toMatchInlineSnapshot(`
      Set {
        "1",
        "2",
      }
    `)
  })

  it("clearSelection", () => {
    let sel = new Selection(["1", "2", "3"])
    sel.selectionMode = "multiple"
    expect(sel.clearSelection()).toMatchInlineSnapshot(`Set {}`)
  })

  it("isSelected", () => {
    let sel = new Selection(["1", "2", "3"])
    sel.selectionMode = "multiple"
    expect(sel.isSelected("1")).toBe(true)
    expect(sel.isSelected("4")).toBe(false)
  })

  it("extend / first", () => {
    let sel = new Selection(["1"])
    sel.selectionMode = "multiple"
    expect(sel.extendSelection(collection, "1", "1")).toMatchInlineSnapshot(`
      Set {
        "1",
      }
    `)
  })

  it("extend / last", () => {
    let sel = new Selection(["1"])
    sel.selectionMode = "multiple"
    expect(sel.extendSelection(collection, "1", "6")).toMatchInlineSnapshot(`
      Set {
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
      }
    `)
  })
})
