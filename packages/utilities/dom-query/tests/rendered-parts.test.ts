// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest"
import { trackRenderedParts } from "../src/observe"

afterEach(() => {
  document.body.innerHTML = ""
})

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
const mutations = () => new Promise((resolve) => setTimeout(resolve))

const track = (rootId: string) => {
  const onChange = vi.fn()
  const stop = trackRenderedParts({
    getContainerEl: () => document.getElementById(rootId),
    getRootNode: () => document,
    parts: { label: () => document.getElementById("label") },
    onChange,
  })
  return { onChange, stop }
}

describe("trackRenderedParts", () => {
  test("reports the parts present after the first frame", async () => {
    document.body.innerHTML = `<div id="root"><span id="label"></span></div>`
    const { onChange } = track("root")
    await nextFrame()
    expect(onChange).toHaveBeenLastCalledWith({ label: true })
  })

  test("follows a part being removed and added", async () => {
    document.body.innerHTML = `<div id="root"><span id="label"></span></div>`
    const { onChange } = track("root")
    await nextFrame()

    document.getElementById("label")!.remove()
    await mutations()
    expect(onChange).toHaveBeenLastCalledWith({ label: false })

    document.getElementById("root")!.append(Object.assign(document.createElement("span"), { id: "label" }))
    await mutations()
    expect(onChange).toHaveBeenLastCalledWith({ label: true })
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  test("finds a part outside the container", async () => {
    document.body.innerHTML = `<span id="label"></span><div id="root"></div>`
    const { onChange } = track("root")
    await nextFrame()
    expect(onChange).toHaveBeenLastCalledWith({ label: true })
  })

  test("waits for a container that mounts late", async () => {
    const { onChange } = track("root")
    await nextFrame()
    expect(onChange).toHaveBeenLastCalledWith({ label: false })

    document.body.innerHTML = `<div id="root"><span id="label"></span></div>`
    await mutations()
    expect(onChange).toHaveBeenLastCalledWith({ label: true })
  })

  test("stops reporting after cleanup", async () => {
    document.body.innerHTML = `<div id="root"><span id="label"></span></div>`
    const { onChange, stop } = track("root")
    await nextFrame()
    stop()
    document.getElementById("label")!.remove()
    await mutations()
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
