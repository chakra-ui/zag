// @vitest-environment jsdom

import { describe, expect, test, vi } from "vitest"
import { whenNode } from "../src/when-node"

function raf() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function mountNode() {
  const node = document.createElement("div")
  document.body.appendChild(node)
  return node
}

describe("whenNode", () => {
  test("runs synchronously when the node is already committed", () => {
    const node = mountNode()
    const fn = vi.fn()

    whenNode(node, fn, { defer: true })

    expect(fn).toHaveBeenCalledWith(node)
  })

  test("runs on the microtask tick when the node commits after the call", async () => {
    let node: HTMLElement | null = null
    const fn = vi.fn()

    whenNode(() => node, fn, { defer: true })
    expect(fn).not.toHaveBeenCalled()

    node = mountNode()
    await Promise.resolve()

    expect(fn).toHaveBeenCalledWith(node)
  })

  test("falls back to a frame when the node is still missing at the microtask", async () => {
    let node: HTMLElement | null = null
    const fn = vi.fn()

    whenNode(() => node, fn, { defer: true })

    await Promise.resolve()
    expect(fn).not.toHaveBeenCalled()

    node = mountNode()
    await raf()

    expect(fn).toHaveBeenCalledWith(node)
  })

  test("never calls fn without a node, and reports via onMissing", async () => {
    const fn = vi.fn()
    const onMissing = vi.fn()

    whenNode(() => null, fn, { defer: true, onMissing })

    await Promise.resolve()
    await raf()

    expect(fn).not.toHaveBeenCalled()
    expect(onMissing).toHaveBeenCalledTimes(1)
  })

  test("calls onMissing immediately when not deferred and the node is absent", () => {
    const fn = vi.fn()
    const onMissing = vi.fn()

    whenNode(() => null, fn, { onMissing })

    expect(fn).not.toHaveBeenCalled()
    expect(onMissing).toHaveBeenCalledTimes(1)
  })

  test("cleanup cancels pending work before the node commits", async () => {
    let node: HTMLElement | null = null
    const fn = vi.fn()

    const cleanup = whenNode(() => node, fn, { defer: true })
    cleanup()

    node = mountNode()
    await Promise.resolve()
    await raf()

    expect(fn).not.toHaveBeenCalled()
  })

  test("cleanup runs the cleanup returned by fn", () => {
    const node = mountNode()
    const inner = vi.fn()

    const cleanup = whenNode(node, () => inner, { defer: true })
    expect(inner).not.toHaveBeenCalled()

    cleanup()
    expect(inner).toHaveBeenCalledTimes(1)
  })
})
