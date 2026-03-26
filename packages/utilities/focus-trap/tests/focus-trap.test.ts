// @vitest-environment jsdom

import { FocusTrap } from "../src"

function markVisible<T extends HTMLElement>(element: T): T {
  Object.defineProperty(element, "offsetWidth", { configurable: true, get: () => 1 })
  Object.defineProperty(element, "offsetHeight", { configurable: true, get: () => 1 })
  Object.defineProperty(element, "getClientRects", {
    configurable: true,
    value: () => [{ width: 1, height: 1 }],
  })
  return element
}

function createButton(text: string) {
  const button = markVisible(document.createElement("button"))
  button.type = "button"
  button.textContent = text
  return button
}

function createRadio(name: string, checked = false) {
  const radio = markVisible(document.createElement("input"))
  radio.type = "radio"
  radio.name = name
  radio.checked = checked
  return radio
}

function createContainer() {
  const container = markVisible(document.createElement("div"))
  container.tabIndex = -1
  document.body.append(container)
  return container
}

function dispatchTab(target: HTMLElement, shiftKey = false) {
  const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

function dispatchEscape(target: HTMLElement) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

function dispatchPointerDown(target: HTMLElement) {
  const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe("FocusTrap", () => {
  const traps: FocusTrap[] = []

  beforeEach(() => {
    document.body.innerHTML = ""
    Object.assign(globalThis, {
      CSS: {
        escape: (value: string) => value.replace(/["\\]/g, "\\$&"),
      },
    })
  })

  afterEach(() => {
    traps
      .splice(0)
      .reverse()
      .forEach((trap) => trap.deactivate({ returnFocus: false }))
    document.body.innerHTML = ""
  })

  function track(trap: FocusTrap) {
    traps.push(trap)
    return trap
  }

  it("activates and focuses the first tabbable node", () => {
    const container = createContainer()
    const first = createButton("First")
    const second = createButton("Second")
    container.append(first, second)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    expect(document.activeElement).toBe(first)
  })

  it("respects initialFocus when provided", () => {
    const container = createContainer()
    const first = createButton("First")
    const second = createButton("Second")
    container.append(first, second)

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        initialFocus: second,
        fallbackFocus: container,
      }),
    )

    trap.activate()

    expect(document.activeElement).toBe(second)
  })

  it("respects initialFocus=false", () => {
    const trigger = createButton("Trigger")
    document.body.append(trigger)
    trigger.focus()

    const container = createContainer()
    container.append(createButton("Inside"))

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        initialFocus: false,
        fallbackFocus: container,
      }),
    )

    trap.activate()

    expect(document.activeElement).toBe(trigger)
  })

  it("uses fallbackFocus when there are no tabbables", () => {
    const container = createContainer()

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    expect(document.activeElement).toBe(container)
  })

  it("throws when there is no valid focus target", () => {
    const container = markVisible(document.createElement("div"))
    document.body.append(container)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false }))

    expect(() => trap.activate()).toThrow()
  })

  it("falls back cleanly when initialFocus points to a disconnected node", () => {
    const container = createContainer()
    const button = createButton("First")
    container.append(button)

    const stale = createButton("Stale")

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        initialFocus: stale,
        fallbackFocus: button,
      }),
    )

    expect(() => trap.activate()).not.toThrow()
    expect(document.activeElement).toBe(button)
  })

  it("restores focus on deactivate", async () => {
    const trigger = createButton("Trigger")
    document.body.append(trigger)
    trigger.focus()

    const container = createContainer()
    container.append(createButton("Inside"))

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()
    trap.deactivate()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.activeElement).toBe(trigger)
  })

  it("respects setReturnFocus", async () => {
    const trigger = createButton("Trigger")
    const custom = createButton("Custom")
    document.body.append(trigger, custom)
    trigger.focus()

    const container = createContainer()
    container.append(createButton("Inside"))

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        fallbackFocus: container,
        setReturnFocus: custom,
      }),
    )

    trap.activate()
    trap.deactivate()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.activeElement).toBe(custom)
  })

  it("traps forward Tab from the last tabbable", () => {
    const container = createContainer()
    const first = createButton("First")
    const second = createButton("Second")
    container.append(first, second)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()
    second.focus()

    const event = dispatchTab(second)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)
  })

  it("traps backward Shift+Tab from the first tabbable", () => {
    const container = createContainer()
    const first = createButton("First")
    const second = createButton("Second")
    container.append(first, second)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    const event = dispatchTab(first, true)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(second)
  })

  it("cycles correctly when there is only one effective tab stop", () => {
    const container = createContainer()
    const asc = createRadio("sort", true)
    const desc = createRadio("sort")
    const hours = createRadio("sort")
    container.append(asc, desc, hours)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    const event = dispatchTab(asc)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(asc)
  })

  it("deactivates on Escape by default", () => {
    const container = createContainer()
    const button = createButton("Inside")
    container.append(button)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    const event = dispatchEscape(button)

    expect(event.defaultPrevented).toBe(true)
    expect(trap.active).toBe(false)
  })

  it("does not deactivate on Escape when disabled", () => {
    const container = createContainer()
    const button = createButton("Inside")
    container.append(button)

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        fallbackFocus: container,
        escapeDeactivates: false,
      }),
    )
    trap.activate()

    const event = dispatchEscape(button)

    expect(event.defaultPrevented).toBe(false)
    expect(trap.active).toBe(true)
  })

  it("blocks outside click by default", () => {
    const container = createContainer()
    container.append(createButton("Inside"))
    const outside = createButton("Outside")
    document.body.append(outside)

    const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
    trap.activate()

    const event = dispatchPointerDown(outside)

    expect(event.defaultPrevented).toBe(true)
    expect(trap.active).toBe(true)
  })

  it("allows outside click when allowOutsideClick is true", () => {
    const container = createContainer()
    container.append(createButton("Inside"))
    const outside = createButton("Outside")
    document.body.append(outside)

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        fallbackFocus: container,
        allowOutsideClick: true,
      }),
    )
    trap.activate()

    const event = dispatchPointerDown(outside)

    expect(event.defaultPrevented).toBe(false)
    expect(trap.active).toBe(true)
  })

  it("deactivates on outside click when clickOutsideDeactivates is true", () => {
    const container = createContainer()
    container.append(createButton("Inside"))
    const outside = createButton("Outside")
    document.body.append(outside)

    const trap = track(
      new FocusTrap(container, {
        document,
        delayInitialFocus: false,
        fallbackFocus: container,
        clickOutsideDeactivates: true,
      }),
    )
    trap.activate()

    dispatchPointerDown(outside)

    expect(trap.active).toBe(false)
  })
})
