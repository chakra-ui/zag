// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { trackFieldsetDisabled } from "../src"

afterEach(() => {
  document.body.innerHTML = ""
})

const track = (selector: string) => {
  let disabled: boolean | undefined
  trackFieldsetDisabled(document.querySelector<HTMLElement>(selector), (value) => {
    disabled = value
  })
  return () => disabled
}

describe("trackFieldsetDisabled", () => {
  test("a disabled fieldset disables its controls", () => {
    document.body.innerHTML = `<fieldset disabled><div id="control"></div></fieldset>`
    expect(track("#control")()).toBe(true)
  })

  test("controls in the first legend stay enabled", () => {
    document.body.innerHTML = `<fieldset disabled><legend><div id="in-legend"></div></legend><legend><div id="second"></div></legend></fieldset>`
    expect(track("#in-legend")()).toBe(false)
    expect(track("#second")()).toBe(true)
  })

  test("an outer disabled fieldset still applies inside an inner legend", () => {
    document.body.innerHTML = `<fieldset disabled><fieldset><legend><div id="control"></div></legend></fieldset></fieldset>`
    expect(track("#control")()).toBe(true)
  })

  test("an enabled fieldset leaves controls enabled", () => {
    document.body.innerHTML = `<fieldset><div id="control"></div></fieldset>`
    expect(track("#control")()).toBe(false)
  })
})
