// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { contains } from "../src"

describe("contains", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("follows a same-origin iframe up to its element", () => {
    const parent = document.createElement("div")
    const iframe = document.createElement("iframe")
    parent.append(iframe)
    document.body.append(parent)

    const child = iframe.contentDocument!.createElement("button")
    iframe.contentDocument!.body.append(child)

    expect(contains(parent, child)).toBe(true)
    expect(contains(document.createElement("div"), child)).toBe(false)
  })

  test("follows a shadow root up to its host", () => {
    const host = document.createElement("div")
    document.body.append(host)
    const child = document.createElement("button")
    host.attachShadow({ mode: "open" }).append(child)

    expect(contains(host, child)).toBe(true)
  })
})
