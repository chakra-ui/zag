import { describe, expect, it } from "vitest"
import { createAnatomy } from "./create-anatomy"

describe("Anatomy", () => {
  it("should allow to set parts", () => {
    const anamtomy = createAnatomy("accordion").parts("root").build()
    expect(anamtomy).toMatchInlineSnapshot(`
      {
        "root": {
          "attrs": {
            "data-part": "root",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"root\\"], & [data-scope=\\"accordion\\"][data-part=\\"root\\"]",
        },
      }
    `)
  })

  it("should convert string to kebab case if needed", () => {
    const anamtomy = createAnatomy("hoverCard").parts("toggleButton").build()
    expect(anamtomy).toMatchInlineSnapshot(`
      {
        "toggleButton": {
          "attrs": {
            "data-part": "toggle-button",
            "data-scope": "hover-card",
          },
          "selector": "&[data-scope=\\"hover-card\\"][data-part=\\"toggle-button\\"], & [data-scope=\\"hover-card\\"][data-part=\\"toggle-button\\"]",
        },
      }
    `)
  })

  it("should filter duplicate values", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control", "control").build()
    expect(anatomy).toMatchInlineSnapshot(`
      {
        "control": {
          "attrs": {
            "data-part": "control",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"control\\"], & [data-scope=\\"accordion\\"][data-part=\\"control\\"]",
        },
        "root": {
          "attrs": {
            "data-part": "root",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"root\\"], & [data-scope=\\"accordion\\"][data-part=\\"root\\"]",
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
          "attrs": {
            "data-part": "control",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"control\\"], & [data-scope=\\"accordion\\"][data-part=\\"control\\"]",
        },
        "root": {
          "attrs": {
            "data-part": "root",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"root\\"], & [data-scope=\\"accordion\\"][data-part=\\"root\\"]",
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
          "attrs": {
            "data-part": "control",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"control\\"], & [data-scope=\\"accordion\\"][data-part=\\"control\\"]",
        },
        "root": {
          "attrs": {
            "data-part": "root",
            "data-scope": "accordion",
          },
          "selector": "&[data-scope=\\"accordion\\"][data-part=\\"root\\"], & [data-scope=\\"accordion\\"][data-part=\\"root\\"]",
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
})
