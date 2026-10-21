// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { VanillaMachine } from "../../../frameworks/vanilla/src/machine"
import { machine as menuMachine } from "../../../machines/menu/src/menu.machine"
import { trackDismissableElement } from "../src/dismissable-layer"
import { layerStack } from "../src/layer-stack"

const cleanups: VoidFunction[] = []
const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(async () => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((cleanup) => cleanup())
  await flush()
  expect(layerStack.layers).toHaveLength(0)
  layerStack.recentlyRemoved.clear()
  document.body.innerHTML = ""
})

for (const gesture of ["submenu hover", "context-menu long press"] as const) {
  test(`preserves the owning layer through delayed ${gesture} opening`, async () => {
    const parent = document.createElement("div")
    const trigger = document.createElement("button")
    trigger.id = gesture === "submenu hover" ? "child-trigger" : "child-context-trigger"
    parent.append(trigger)
    const positioner = document.createElement("div")
    positioner.id = "child-positioner"
    const content = document.createElement("div")
    content.id = "child-content"
    positioner.append(content)
    document.body.append(parent, positioner)

    const closeParent = trackDismissableElement(parent, { onDismiss() {} })
    cleanups.push(closeParent)
    const service = new VanillaMachine(menuMachine, {
      id: "child",
      ids: {
        trigger: "child-trigger",
        contextTrigger: "child-context-trigger",
        content: "child-content",
        positioner: "child-positioner",
      },
    })
    service.start()
    cleanups.push(() => service.stop())
    await flush()

    if (gesture === "submenu hover") {
      service.context.set("isSubmenu", true)
      service.send({ type: "TRIGGER_POINTERMOVE", target: trigger, point: { x: 1, y: 1 } })
      await flush()
      service.send({ type: "DELAY.OPEN" })
    } else {
      service.send({ type: "CONTEXT_MENU_START", point: { x: 1, y: 1 } })
      await flush()
      service.send({ type: "LONG_PRESS.OPEN" })
    }
    await flush()
    expect(service.state.get()).toBe("open")
    expect(service.context.get("dismissableTrigger").getId()).toBe(trigger.id)
    expect(layerStack.layers.find((layer) => layer.node === content)?.owner?.node).toBe(parent)
    closeParent()
    await flush()
    expect(service.state.get()).toBe("closed")
  })
}
