import { createAnatomy } from "./create-anatomy"

describe("Anatomy", () => {
  it("should allow to set parts", () => {
    const anamtomy = createAnatomy("accordion").parts("root").build()
    expect(anamtomy).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
    })
  })

  it("should filter duplicate values", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control", "control").build()
    expect(anatomy).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
  })

  it("should allow to extend the anatomy", () => {
    const anatomy = createAnatomy("accordion").parts("root")
    const extendedAnatomy = anatomy.extend("control").build()

    expect(extendedAnatomy).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
  })

  it("should filter duplicates parts when extending", () => {
    const anatomy = createAnatomy("accordion").parts("root", "control")
    const extendedAnatomy = anatomy.extend("control").build()

    expect(extendedAnatomy).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
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
