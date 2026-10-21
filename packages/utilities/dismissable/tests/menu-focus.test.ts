// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { VanillaMachine } from "../../../frameworks/vanilla/src/machine"
import { machine } from "../../../machines/menu/src/menu.machine"
import type { MenuSchema } from "../../../machines/menu/src/menu.types"
import { layerStack } from "../src/layer-stack"

let service: VanillaMachine<MenuSchema>

afterEach(() => {
  service?.stop()
  layerStack.recentlyRemoved.clear()
  document.body.innerHTML = ""
})

for (const restoreFocus of [false, true]) {
  test(`preserves restoreFocus=${restoreFocus} through delayed controlled close confirmation`, async () => {
    document.body.innerHTML = `
      <button id="trigger">Open</button>
      <input id="outside" />
      <div id="positioner"><div id="content" tabindex="-1"></div></div>
    `
    const onOpenChange = vi.fn()
    service = new VanillaMachine(machine, {
      id: "focus",
      open: true,
      positioning: { listeners: false },
      ids: { trigger: "trigger", content: "content", positioner: "positioner" },
      onOpenChange,
    })
    service.start()
    const outside = document.getElementById("outside")!
    await vi.waitFor(() => expect(document.activeElement).toBe(document.getElementById("content")))

    service.send({ type: "CLOSE", src: "interact-outside", restoreFocus })
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith({ open: false }))
    // The application may confirm later, after another machine event has run.
    service.send({ type: "HIGHLIGHTED.SET", value: "edit" })
    await vi.waitFor(() => expect(service.context.get("highlightedValue")).toBe("edit"))
    outside.focus()
    service.updateProps({ open: false })

    await vi.waitFor(() => expect(service.state.get()).toBe("closed"))
    await Promise.resolve()
    expect(document.activeElement).toBe(document.getElementById(restoreFocus ? "trigger" : "outside"))

    // A later externally controlled opening must not retain the old close intent.
    service.updateProps({ open: true })
    await vi.waitFor(() => expect(document.activeElement).toBe(document.getElementById("content")))
    service.updateProps({ open: false })
    await vi.waitFor(() => expect(document.activeElement).toBe(document.getElementById("trigger")))
  })
}

test("Escape restores focus after an outside press was prevented", async () => {
  document.body.innerHTML = `
    <button id="trigger">Open</button>
    <input id="outside" />
    <div id="content" tabindex="-1"></div>
  `
  const onOpenChange = vi.fn()
  const onInteractOutside = vi.fn((event: Event) => event.preventDefault())
  const onPointerDownOutside = vi.fn()
  service = new VanillaMachine(machine, {
    id: "focus",
    open: true,
    positioning: { listeners: false },
    ids: { trigger: "trigger", content: "content" },
    onOpenChange,
    onInteractOutside,
    onPointerDownOutside,
  })
  service.start()
  await vi.waitFor(() => expect(document.activeElement).toBe(document.getElementById("content")))
  const pointerdown = new MouseEvent("pointerdown", { bubbles: true, button: 0 })
  Object.defineProperty(pointerdown, "pointerType", { value: "mouse" })
  document.getElementById("outside")!.dispatchEvent(pointerdown)
  await vi.waitFor(() => expect(onPointerDownOutside).toHaveBeenCalled())
  expect(onInteractOutside).toHaveBeenCalled()
  expect(onOpenChange).not.toHaveBeenCalled()

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
  await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith({ open: false }))
  service.updateProps({ open: false })
  await vi.waitFor(() => expect(service.state.get()).toBe("closed"))
  await Promise.resolve()
  expect(document.activeElement).toBe(document.getElementById("trigger"))
})
