import { anatomy } from "./anatomy"

describe("Anatomy", () => {
  it("should allow to set parts", () => {
    const result = anatomy("accordion").parts("root").build()
    expect(result).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
    })
  })

  it("should filter duplicate values", () => {
    const result = anatomy("accordion").parts("root", "control", "control").build()
    expect(result).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
  })

  it("should allow to extend the anatomy", () => {
    const baseAnatomy = anatomy("accordion").parts("root")
    const result = baseAnatomy.extends("control").build()

    expect(result).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
  })

  it("should filter duplicates parts when extending", () => {
    const baseAnatomy = anatomy("accordion").parts("root", "control")
    const result = baseAnatomy.extends("control").build()

    expect(result).toEqual({
      root: {
        selector: '[data-scope="accordion"][data-part="root"]',
      },
      control: {
        selector: '[data-scope="accordion"][data-part="control"]',
      },
    })
  })

  it("should not allow to invoke .parts more than once", () => {
    expect(() => anatomy("accordion").parts("a").parts("b")).toThrow()
  })

  it("should not allow to invoke .parts when extending", () => {
    const baseAnatomy = anatomy("accordion").parts("root", "control")
    expect(() => baseAnatomy.parts("b")).toThrow()
  })
})
