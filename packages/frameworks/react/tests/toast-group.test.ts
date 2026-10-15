import { act } from "@testing-library/react"
import { groupMachine } from "../../../machines/toast/src/toast-group.machine"
import { createToastStore } from "../../../machines/toast/src/toast.store"
import { renderMachine } from "./render"

describe("toast group layout initialization", () => {
  test.each([true, false])("initializes visible and queued toasts consistently (overlap: %s)", async (overlap) => {
    const store = createToastStore({ overlap, max: 2 })
    if (overlap) store.expand()
    else store.collapse()
    store.create({ id: "first" })
    store.create({ id: "second" })
    store.create({ id: "queued" })

    const group = renderMachine(groupMachine, { store, id: "group" })
    await act(async () => {})
    expect(group.result.current.state.get()).toBe(overlap ? "overlap" : "stack")
    expect(store.getVisibleToasts().map((toast) => toast.stacked)).toEqual([!overlap, !overlap])
    expect(group.result.current.context.get("toasts")).toEqual(store.getVisibleToasts())

    await act(async () => store.remove("first"))
    expect(store.getVisibleToasts()).toContainEqual(expect.objectContaining({ id: "queued", stacked: !overlap }))
    group.unmount()
  })

  test.each(["retained", "replaced", "empty"])("resets a reused store with %s toasts on remount", async (contents) => {
    const store = createToastStore({ overlap: true })
    store.create({ id: "first" })
    store.create({ id: "second" })
    const first = renderMachine(groupMachine, { store, id: "first-group" })
    await first.send({ type: "REGION.POINTER_ENTER" })
    expect(store.getVisibleToasts().every((toast) => toast.stacked)).toBe(true)
    first.unmount()
    await act(async () => {})

    if (contents !== "retained") store.remove()
    if (contents === "replaced") {
      store.create({ id: "replacement-1" })
      store.create({ id: "replacement-2" })
    }
    const second = renderMachine(groupMachine, { store, id: "second-group" })
    await act(async () => {})
    expect(second.result.current.state.get()).toBe("overlap")
    expect(store.getVisibleToasts().every((toast) => !toast.stacked)).toBe(true)
    await act(async () => {
      store.create({ id: "new-1" })
      store.create({ id: "new-2" })
    })
    expect(store.getVisibleToasts().every((toast) => !toast.stacked)).toBe(true)

    await second.send({ type: "REGION.POINTER_ENTER" })
    await act(async () => store.create({ id: "expanded" }))
    expect(store.getVisibleToasts().every((toast) => toast.stacked)).toBe(true)
    await second.send({ type: "REGION.POINTER_LEAVE" })
    expect(store.getVisibleToasts().every((toast) => !toast.stacked)).toBe(true)
    second.unmount()
  })

  test("does not reset the layout during an ordinary rerender", async () => {
    const store = createToastStore({ overlap: true })
    store.create({ id: "first" })
    store.create({ id: "second" })
    const group = renderMachine(groupMachine, { store, id: "group" })
    await group.send({ type: "REGION.POINTER_ENTER" })
    group.rerender()
    await act(async () => store.create({ id: "new" }))
    expect(group.result.current.state.get()).toBe("stack")
    expect(store.getVisibleToasts().map((toast) => toast.stacked)).toEqual([true, true, true])
    group.unmount()
  })
})
