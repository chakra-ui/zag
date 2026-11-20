// @vitest-environment jsdom

import { describe, expect, test } from "vitest"
import { isEditableElement } from "../src"

const create = (tag: string) => document.createElement(tag)

describe("isEditableElement", () => {
  test("matches text fields", () => {
    const input = create("input")
    expect(isEditableElement(input)).toBe(true)
    expect(isEditableElement(create("textarea"))).toBe(true)
    expect(isEditableElement(create("select"))).toBe(true)
  })

  test("ignores custom elements named after a field", () => {
    expect(isEditableElement(create("ark-select-list"))).toBe(false)
    expect(isEditableElement(create("x-multiselect"))).toBe(false)
    expect(isEditableElement(create("my-textarea"))).toBe(false)
  })

  test("matches contenteditable elements", () => {
    const div = create("div")
    div.setAttribute("contenteditable", "true")
    expect(isEditableElement(div)).toBe(true)
  })
})
