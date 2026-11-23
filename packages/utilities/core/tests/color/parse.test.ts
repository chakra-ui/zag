import { describe, expect, test } from "vitest"
import { parseColor } from "../../src/color"

const css = (value: string) => parseColor(value).toString("css")
const hex = (value: string) => parseColor(value).toString("hex")

describe("parseColor / rgb", () => {
  test("comma and space syntax", () => {
    expect(css("rgb(255, 0, 0)")).toBe("rgba(255, 0, 0, 1)")
    expect(css("rgba(255, 0, 0, 0.5)")).toBe("rgba(255, 0, 0, 0.5)")
    expect(css("rgb(255 0 0)")).toBe("rgba(255, 0, 0, 1)")
    expect(css("rgb(255 0 0 / 0.5)")).toBe("rgba(255, 0, 0, 0.5)")
    expect(css("rgba(255  0   0/50%)")).toBe("rgba(255, 0, 0, 0.5)")
  })

  test("percentages", () => {
    expect(css("rgba(255, 0, 0, 50%)")).toBe("rgba(255, 0, 0, 0.5)")
    expect(hex("rgb(10%, 20%, 30%)")).toBe("#1A334D")
    expect(hex("rgb(100% 0% 0%)")).toBe("#FF0000")
  })

  test("clamps out of range values", () => {
    expect(css("rgb(300, -10, 0, 2)")).toBe("rgba(255, 0, 0, 1)")
  })

  test("rejects invalid values", () => {
    for (const value of [
      "rgb(foo, 0, 0)",
      "rgb(, , )",
      "rgb(1, 2)",
      "rgb(1, 2, 3, 0.5, 9)",
      "rgb(1 2 3 / 0.5 / 1)",
      "rgb(1, 2, 3 / 0.5)",
      "rgb(1 2)",
      "rgb()",
      "rgb(0x10, 0, 0)",
      "rgb(1, 2, 3",
    ]) {
      expect(() => parseColor(value), value).toThrow("Invalid color value")
    }
  })
})

describe("parseColor / hex", () => {
  test("rounds fractional channels", () => {
    expect(hex("rgb(10.5, 20, 30)")).toBe("#0B141E")
    expect(hex("rgb(127.5, 127.5, 127.5)")).toBe("#808080")
    expect(parseColor("rgb(127.5, 0, 0, 0.5)").toString("hexa")).toBe("#80000080")
    expect(parseColor("#000").withChannelValue("red", 10.4).toString("hex")).toBe("#0A0000")
    expect(parseColor("rgb(127.6, 0, 0)").toHexInt()).toBe(0x800000)
  })
})

describe("parseColor / hsl and hsb", () => {
  test("comma and space syntax", () => {
    expect(css("hsl(10, 50%, 50%)")).toBe("hsla(10, 50%, 50%, 1)")
    expect(css("hsla(10, 50%, 50%, 0.5)")).toBe("hsla(10, 50%, 50%, 0.5)")
    expect(css("hsl(10 50% 50%)")).toBe("hsla(10, 50%, 50%, 1)")
    expect(css("hsl(10deg 50% 50% / 50%)")).toBe("hsla(10, 50%, 50%, 0.5)")
    expect(css("hsla(10, 50%, 50%, .5)")).toBe("hsla(10, 50%, 50%, 0.5)")
    expect(parseColor("hsb(10 50% 50% / 0.5)").toString("hsba")).toBe("hsba(10, 50%, 50%, 0.5)")
  })

  test("rejects invalid values", () => {
    for (const value of ["hsl(10a5, 50%, 50%)", "hsl(10, 50%, 50%)x", "hsl(10%, 50%, 50%)", "hsb(10, 50%)"]) {
      expect(() => parseColor(value), value).toThrow("Invalid color value")
    }
  })
})

describe("parseColor / named", () => {
  test("matches the CSS values, both gray spellings and any case", () => {
    expect(parseColor("mediumpurple").toString("hex")).toBe("#9370DB")
    expect(parseColor("palevioletred").toString("hex")).toBe("#DB7093")
    expect(parseColor("lightgray").toString("hex")).toBe("#D3D3D3")
    expect(parseColor("lightgrey").toString("hex")).toBe("#D3D3D3")
    expect(parseColor(" Red ").toString("hex")).toBe("#FF0000")
  })

  test("transparent", () => {
    expect(parseColor("transparent").getChannelValue("alpha")).toBe(0)
  })
})
