import { describe, expect, test } from "vitest"
import { isAcceptedDragType } from "../../src/file"

describe("isAcceptedDragType", () => {
  test("any type is accepted without rules", () => {
    expect(isAcceptedDragType("application/zip", undefined)).toBe(true)
  })

  test("matches exact and wildcard types", () => {
    expect(isAcceptedDragType("image/png", "image/png")).toBe(true)
    expect(isAcceptedDragType("image/png", "image/*")).toBe(true)
    expect(isAcceptedDragType("text/plain;charset=utf-8", "text/plain")).toBe(true)
    expect(isAcceptedDragType("application/pdf", "image/*")).toBe(false)
  })

  test("matches extension rules through their type", () => {
    expect(isAcceptedDragType("application/pdf", ".pdf")).toBe(true)
    expect(isAcceptedDragType("image/png", ".pdf")).toBe(false)
  })

  test("an empty type or an unknown extension can't be ruled out", () => {
    expect(isAcceptedDragType("", "image/*")).toBe(true)
    expect(isAcceptedDragType("application/x-custom", ".custom-ext")).toBe(true)
  })
})
