import { describe, expect, it } from "vitest"
import { createAnatomy } from "../src"

describe("Anatomy", () => {
  it("should allow to set parts", () => {
    const anatomy = createAnatomy("accordion").parts("root").build()
    expect(anatomy).toMatchInlineSnapshot(`
      {
        "root": {
          "attr": "data-accordion-root",
          "attrs": [Function],
          "selector": "&[data-accordion-root], & [data-accordion-root]",
        },
      }
    `)
    expect(anatomy.root.attrs("accordion:1")).toMatchInlineSnapshot(`
      {
        "data-accordion-root": "accordion:1",
      }
    `)
  })

  it("should convert string to kebab case if needed", () => {
    const anatomy = createAnatomy("hoverCard").parts("toggleButton").build()
    expect(anatomy).toMatchInlineSnapshot(`
      {
        "toggleButton": {
          "attr": "data-hover-card-toggle-button",
          "attrs": [Function],
          "selector": "&[data-hover-card-toggle-button], & [data-hover-card-toggle-button]",
        },
      }
    `)
    expect(anatomy.toggleButton.attrs("hc:1")).toMatchInlineSnapshot(`
      {
        "data-hover-card-toggle-button": "hc:1",
      }
    `)
  })

  it("should filter duplicate values", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control", "control").build()
    expect(anatomy).toMatchInlineSnapshot(`
      {
        "control": {
          "attr": "data-accordion-control",
          "attrs": [Function],
          "selector": "&[data-accordion-control], & [data-accordion-control]",
        },
        "root": {
          "attr": "data-accordion-root",
          "attrs": [Function],
          "selector": "&[data-accordion-root], & [data-accordion-root]",
        },
      }
    `)
  })

  it("should allow to extend the anatomy", () => {
    const anatomy = createAnatomy("accordion").parts("root")
    const extendedAnatomy = anatomy.extendWith("control").build()

    expect(extendedAnatomy).toMatchInlineSnapshot(`
      {
        "control": {
          "attr": "data-accordion-control",
          "attrs": [Function],
          "selector": "&[data-accordion-control], & [data-accordion-control]",
        },
        "root": {
          "attr": "data-accordion-root",
          "attrs": [Function],
          "selector": "&[data-accordion-root], & [data-accordion-root]",
        },
      }
    `)
  })

  it("should filter duplicates parts when extending", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control")
    const extendedAnatomy = anatomy.extendWith("control").build()

    expect(extendedAnatomy).toMatchInlineSnapshot(`
      {
        "control": {
          "attr": "data-accordion-control",
          "attrs": [Function],
          "selector": "&[data-accordion-control], & [data-accordion-control]",
        },
        "root": {
          "attr": "data-accordion-root",
          "attrs": [Function],
          "selector": "&[data-accordion-root], & [data-accordion-root]",
        },
      }
    `)
  })

  it("should rename component scope", () => {
    const anatomy = createAnatomy("radio-group").parts("root", "control").rename("segmented-control")
    expect(anatomy.build()).toMatchInlineSnapshot(`
      {
        "control": {
          "attr": "data-segmented-control-control",
          "attrs": [Function],
          "selector": "&[data-segmented-control-control], & [data-segmented-control-control]",
        },
        "root": {
          "attr": "data-segmented-control-root",
          "attrs": [Function],
          "selector": "&[data-segmented-control-root], & [data-segmented-control-root]",
        },
      }
    `)
  })

  it("should not allow to invoke .parts more than once", () => {
    // @ts-expect-error
    expect(() => createAnatomy("accordion").parts("a").parts("b")).toThrow()
  })

  it("should not allow to invoke .parts when extending", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control")
    // @ts-expect-error
    expect(() => anatomy.parts("b")).toThrow()
  })

  it("should return correct keys", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control")
    const keys = anatomy.keys()

    expect(keys).toEqual(["root", "control"])
  })

  it("should return correct keys when extended", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control").extendWith("part3", "part4")
    const keys = anatomy.keys()

    expect(keys).toEqual(["root", "control", "part3", "part4"])
  })
})
