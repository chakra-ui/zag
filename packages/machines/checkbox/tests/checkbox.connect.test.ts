// @vitest-environment jsdom
import { createScope } from "@zag-js/core"
import { createNormalizer } from "@zag-js/types"
import { describe, expect, test, vi } from "vitest"
import { connect } from "../src/checkbox.connect"
import { machine } from "../src/checkbox.machine"
import type { CheckboxService } from "../src/checkbox.types"

describe("checkbox.connect", () => {
  const normalizeProps = createNormalizer((v) => v)

  test("hidden input aria-labelledby references label when rendered.label is true", () => {
    const scope = createScope({ id: "cb" })
    const service: Partial<CheckboxService> = {
      scope,
      context: {
        get(key: string) {
          if (key === "rendered") return { label: true }
          return undefined as any
        },
      } as any,
      prop() {
        return undefined as any
      },
      computed() {
        return undefined as any
      },
      send: vi.fn(),
    }

    const api = connect(service as CheckboxService, normalizeProps)
    expect(api.getHiddenInputProps()["aria-labelledby"]).toBe("checkbox:cb:label")
  })

  test("hidden input aria-labelledby is undefined when rendered.label is false", () => {
    const scope = createScope({ id: "cb" })
    const service: Partial<CheckboxService> = {
      scope,
      context: {
        get(key: string) {
          if (key === "rendered") return { label: false }
          return undefined as any
        },
      } as any,
      prop() {
        return undefined as any
      },
      computed() {
        return undefined as any
      },
      send: vi.fn(),
    }

    const api = connect(service as CheckboxService, normalizeProps)
    expect(api.getHiddenInputProps()["aria-labelledby"]).toBeUndefined()
  })

  test("tracks label element presence and mutations in DOM", async () => {
    const root = document.createElement("div")
    root.id = "checkbox:cb"
    document.body.appendChild(root)

    let renderedState = { label: true }
    const context = {
      set: vi.fn((key: string, val: any) => {
        if (key === "rendered") renderedState = val
      }),
      get: vi.fn((key: string) => {
        if (key === "rendered") return renderedState
      }),
    }
    const scope = createScope({ id: "cb" })

    const effect = machine.implementations?.effects?.trackRenderedElements
    const cleanup = effect?.({ context, scope } as any)

    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(renderedState.label).toBe(false)

    const label = document.createElement("label")
    label.id = "checkbox:cb:label"
    root.appendChild(label)

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(renderedState.label).toBe(true)

    root.removeChild(label)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(renderedState.label).toBe(false)

    cleanup?.()
    root.remove()
  })
})
