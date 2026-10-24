import { describe, expect, test } from "vitest"
import type { ToastGroupService, ToastHeight } from "../src/toast.types"
import { setHeight } from "../src/toast.utils"

function createParent(toastIds: string[]) {
  const ctx: Record<string, any> = { toasts: toastIds.map((id) => ({ id })), heights: [] as ToastHeight[] }
  return {
    context: {
      get: (key: string) => ctx[key],
      set: (key: string, value: any) => {
        ctx[key] = typeof value === "function" ? value(ctx[key]) : value
      },
    },
  } as unknown as ToastGroupService
}

const ids = (parent: ToastGroupService) => parent.context.get("heights").map((h) => h.id)

describe("toast setHeight", () => {
  test("keeps heights in toasts order when toasts mount in the same flush", () => {
    // `toasts` is newest first; batching adapters mount children in that order
    const parent = createParent(["b", "a"])
    setHeight(parent, { id: "b", height: 20 })
    setHeight(parent, { id: "a", height: 10 })
    expect(ids(parent)).toEqual(["b", "a"])
  })

  test("prepends a toast created after the others mounted", () => {
    const parent = createParent(["b", "a"])
    setHeight(parent, { id: "a", height: 10 })
    setHeight(parent, { id: "b", height: 20 })
    expect(ids(parent)).toEqual(["b", "a"])
  })

  test("updates an existing height in place", () => {
    const parent = createParent(["b", "a"])
    setHeight(parent, { id: "b", height: 20 })
    setHeight(parent, { id: "a", height: 10 })
    setHeight(parent, { id: "a", height: 30 })
    expect(parent.context.get("heights")).toEqual([
      { id: "b", height: 20 },
      { id: "a", height: 30 },
    ])
  })
})
