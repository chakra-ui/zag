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

  describe("persistentElements", () => {
    it("does not block pointerdown on a persistent element", () => {
      const container = createContainer()
      container.append(createButton("Inside"))
      const persistent = createButton("Toast")
      document.body.append(persistent)

      const trap = track(
        new FocusTrap(container, {
          document,
          delayInitialFocus: false,
          fallbackFocus: container,
          persistentElements: [() => persistent],
        }),
      )
      trap.activate()

      const event = dispatchPointerDown(persistent)

      expect(event.defaultPrevented).toBe(false)
      expect(trap.active).toBe(true)
    })

    it("does not pull focus back when moved to a persistent element", () => {
      const container = createContainer()
      container.append(createButton("Inside"))
      const persistent = createButton("Toast")
      document.body.append(persistent)

      const trap = track(
        new FocusTrap(container, {
          document,
          delayInitialFocus: false,
          fallbackFocus: container,
          persistentElements: [() => persistent],
        }),
      )
      trap.activate()

      persistent.focus()

      expect(document.activeElement).toBe(persistent)
    })

    it("still treats other outside elements as escaping when persistentElements is set", () => {
      const container = createContainer()
      container.append(createButton("Inside"))
      const persistent = createButton("Toast")
      const other = createButton("Other")
      document.body.append(persistent, other)

      const trap = track(
        new FocusTrap(container, {
          document,
          delayInitialFocus: false,
          fallbackFocus: container,
          persistentElements: [() => persistent],
        }),
      )
      trap.activate()

      const event = dispatchPointerDown(other)

      expect(event.defaultPrevented).toBe(true)
      expect(trap.active).toBe(true)
    })
  })

  describe("followControlledElements", () => {
    it("treats an expanded aria-controls target outside the container as inside the trap", () => {
      const container = createContainer()
      const trigger = createButton("Open listbox")
      trigger.setAttribute("aria-controls", "listbox-1")
      trigger.setAttribute("aria-expanded", "true")
      container.append(trigger)

      const listbox = markVisible(document.createElement("div"))
      listbox.id = "listbox-1"
      listbox.setAttribute("role", "listbox")
      const option = createButton("Option 1")
      listbox.append(option)
      document.body.append(listbox)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      const event = dispatchPointerDown(option)

      expect(event.defaultPrevented).toBe(false)
      expect(trap.active).toBe(true)
    })

    it("does not follow aria-controls when the controller is collapsed", () => {
      const container = createContainer()
      const trigger = createButton("Open listbox")
      trigger.setAttribute("aria-controls", "listbox-1")
      trigger.setAttribute("aria-expanded", "false")
      container.append(trigger)

      const listbox = markVisible(document.createElement("div"))
      listbox.id = "listbox-1"
      listbox.setAttribute("role", "listbox")
      const option = createButton("Option 1")
      listbox.append(option)
      document.body.append(listbox)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      const event = dispatchPointerDown(option)

      expect(event.defaultPrevented).toBe(true)
      expect(trap.active).toBe(true)
    })

    it("ignores aria-controls when followControlledElements is false", () => {
      const container = createContainer()
      const trigger = createButton("Open listbox")
      trigger.setAttribute("aria-controls", "listbox-1")
      trigger.setAttribute("aria-expanded", "true")
      container.append(trigger)

      const listbox = markVisible(document.createElement("div"))
      listbox.id = "listbox-1"
      listbox.setAttribute("role", "listbox")
      const option = createButton("Option 1")
      listbox.append(option)
      document.body.append(listbox)

      const trap = track(
        new FocusTrap(container, {
          document,
          delayInitialFocus: false,
          fallbackFocus: container,
          followControlledElements: false,
        }),
      )
      trap.activate()

      const event = dispatchPointerDown(option)

      expect(event.defaultPrevented).toBe(true)
      expect(trap.active).toBe(true)
    })
  })

  describe("multiple containers", () => {
    it("wraps Tab forward and backward across containers", () => {
      const containerA = createContainer()
      const a1 = createButton("A1")
      containerA.append(a1)

      const containerB = createContainer()
      const b1 = createButton("B1")
      containerB.append(b1)

      const trap = track(
        new FocusTrap([containerA, containerB], {
          document,
          delayInitialFocus: false,
          fallbackFocus: containerA,
        }),
      )
      trap.activate()

      expect(document.activeElement).toBe(a1)

      const forward = dispatchTab(a1)
      expect(forward.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(b1)

      const forwardWrap = dispatchTab(b1)
      expect(forwardWrap.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(a1)

      const backwardWrap = dispatchTab(a1, true)
      expect(backwardWrap.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(b1)
    })
  })

  describe("nested traps", () => {
    it("pauses the previous trap when a new one activates, and unpauses it on deactivate", () => {
      const stack: FocusTrap[] = []

      const containerA = createContainer()
      containerA.append(createButton("A"))
      const containerB = createContainer()
      containerB.append(createButton("B"))

      const trapA = track(
        new FocusTrap(containerA, {
          document,
          delayInitialFocus: false,
          fallbackFocus: containerA,
          trapStack: stack,
        }),
      )
      trapA.activate()

      expect(trapA.active).toBe(true)
      expect(trapA.paused).toBe(false)

      const trapB = track(
        new FocusTrap(containerB, {
          document,
          delayInitialFocus: false,
          fallbackFocus: containerB,
          trapStack: stack,
        }),
      )
      trapB.activate()

      expect(trapA.paused).toBe(true)
      expect(trapB.active).toBe(true)
      expect(trapB.paused).toBe(false)

      trapB.deactivate({ returnFocus: false })

      expect(trapA.paused).toBe(false)
      expect(trapA.active).toBe(true)
    })

    it("supports manual pause and unpause", () => {
      const container = createContainer()
      container.append(createButton("Inside"))
      const outside = createButton("Outside")
      document.body.append(outside)

      const trap = track(
        new FocusTrap(container, {
          document,
          delayInitialFocus: false,
          fallbackFocus: container,
          trapStack: [],
        }),
      )
      trap.activate()

      trap.pause()
      expect(trap.paused).toBe(true)

      // Listeners are detached while paused, so outside pointerdown is no longer intercepted.
      const whilePaused = dispatchPointerDown(outside)
      expect(whilePaused.defaultPrevented).toBe(false)

      trap.unpause()
      expect(trap.paused).toBe(false)

      const afterUnpause = dispatchPointerDown(outside)
      expect(afterUnpause.defaultPrevented).toBe(true)
    })

    it("still returns focus to the child's target after the parent reclaims its own initial focus on unpause", async () => {
      const stack: FocusTrap[] = []

      const containerA = createContainer()
      const parentFirst = createButton("Parent First")
      const trigger = createButton("Open Nested")
      containerA.append(parentFirst, trigger)

      const containerB = createContainer()
      containerB.append(createButton("Child Inside"))

      const trapA = track(
        new FocusTrap(containerA, {
          document,
          delayInitialFocus: false,
          fallbackFocus: containerA,
          trapStack: stack,
        }),
      )
      trapA.activate()
      expect(document.activeElement).toBe(parentFirst)

      trigger.focus()

      const trapB = track(
        new FocusTrap(containerB, {
          document,
          delayInitialFocus: false,
          fallbackFocus: containerB,
          trapStack: stack,
          setReturnFocus: () => trigger,
        }),
      )
      trapB.activate()
      expect(trapA.paused).toBe(true)

      trapB.deactivate()

      // Unpausing trapA happens synchronously inside trapB.deactivate(), and reclaims
      // its own initial focus before trapB's own deferred return focus gets a chance to run.
      expect(document.activeElement).toBe(parentFirst)

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(trigger)
    })

    it("does not throw when auto-unpausing an outer trap whose focus target is gone", () => {
      // Simulates a Dialog (outer trap) containing a Popover (inner trap). Deactivating
      // the Popover makes `deactivateTrap()` call `unpause()` on the Dialog trap as pure
      // internal housekeeping, even though the Dialog itself stays open the whole time.
      const stack: FocusTrap[] = []

      const dialogContainer = createContainer()
      const dialogTrigger = createButton("Dialog trigger")
      dialogContainer.append(dialogTrigger)

      const popoverContainer = createContainer()
      popoverContainer.append(createButton("Popover button"))

      const dialogTrap = track(
        new FocusTrap(dialogContainer, {
          document,
          delayInitialFocus: false,
          fallbackFocus: () => dialogTrigger,
          trapStack: stack,
        }),
      )
      dialogTrap.activate()

      const popoverTrap = track(
        new FocusTrap(popoverContainer, {
          document,
          delayInitialFocus: false,
          fallbackFocus: popoverContainer,
          trapStack: stack,
        }),
      )
      popoverTrap.activate() // pauses dialogTrap via the shared trap stack

      // The dialog's only tabbable/fallback element is removed while the popover is
      // still open (e.g. mid re-render), so at the moment of automatic re-focus the
      // dialog trap has zero connected focusable elements.
      dialogTrigger.remove()

      expect(() => popoverTrap.deactivate({ returnFocus: false })).not.toThrow()
      expect(dialogTrap.active).toBe(true)

      // The dialog trap must still be genuinely functional afterward, not just
      // internally marked active with its listeners silently never attached.
      const outside = createButton("Outside")
      document.body.append(outside)
      const event = dispatchPointerDown(outside)
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe("focusVisible on return focus", () => {
    it("passes focusVisible when the deactivation follows a keyboard interaction", async () => {
      const trigger = createButton("Trigger")
      document.body.append(trigger)
      trigger.focus()

      const container = createContainer()
      const inside = createButton("Inside")
      container.append(inside)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      // Flip to pointer, then back to keyboard, to prove the tracking is live rather than default state.
      dispatchPointerDown(inside)
      dispatchTab(inside)

      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus")
      trap.deactivate()
      await new Promise((resolve) => setTimeout(resolve, 0))

      const returnFocusCall = focusSpy.mock.calls.find((args) => args[0] && "focusVisible" in args[0])
      expect(returnFocusCall?.[0]).toMatchObject({ focusVisible: true })

      focusSpy.mockRestore()
    })

    it("omits focusVisible when the deactivation follows a pointer interaction", async () => {
      const trigger = createButton("Trigger")
      document.body.append(trigger)
      trigger.focus()

      const container = createContainer()
      const inside = createButton("Inside")
      container.append(inside)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      dispatchPointerDown(inside)

      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus")
      trap.deactivate()
      await new Promise((resolve) => setTimeout(resolve, 0))

      const returnFocusCall = focusSpy.mock.calls.find((args) => args[0]?.preventScroll !== undefined)
      expect(returnFocusCall?.[0]).not.toHaveProperty("focusVisible")

      focusSpy.mockRestore()
    })
  })

  describe("focus race safety", () => {
    it("does not steal focus back if something else legitimately claimed it before return focus fires", async () => {
      const trigger = createButton("Trigger")
      document.body.append(trigger)
      trigger.focus()

      const container = createContainer()
      container.append(createButton("Inside"))

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      trap.deactivate()

      // Simulate the app moving focus elsewhere (e.g. opening the next dialog) before
      // the trap's deferred return-focus timer has a chance to run.
      const probe = createButton("Probe")
      document.body.append(probe)
      probe.focus()

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(probe)
    })

    it("still returns focus normally when nothing else claims it first", async () => {
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

    it("still returns focus if the reclaimed element is inside one of the (now inert) containers", async () => {
      const trigger = createButton("Trigger")
      document.body.append(trigger)
      trigger.focus()

      const container = createContainer()
      const inside = createButton("Inside")
      container.append(inside)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      trap.deactivate()

      // Focus is still on a node that was part of the trap's own containers (e.g. an exit
      // animation kept it mounted) rather than something new the app focused on purpose.
      inside.focus()

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(trigger)
    })
  })

  describe("delayInitialFocus", () => {
    it("defers initial focus to the next tick when true", async () => {
      const container = createContainer()
      const first = createButton("First")
      container.append(first)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: true, fallbackFocus: container }))
      trap.activate()

      expect(document.activeElement).not.toBe(first)

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(first)
    })
  })

  describe("async gating", () => {
    it("waits for checkCanFocusTrap before giving initial focus", async () => {
      const container = createContainer()
      const first = createButton("First")
      container.append(first)

      let resolveCheck: VoidFunction = () => {}
      const checkCanFocusTrap = () => new Promise<void>((resolve) => (resolveCheck = resolve))

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate({ checkCanFocusTrap })

      expect(document.activeElement).not.toBe(first)

      resolveCheck()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(first)
    })

    it("waits for checkCanReturnFocus before returning focus", async () => {
      const trigger = createButton("Trigger")
      document.body.append(trigger)
      trigger.focus()

      const container = createContainer()
      container.append(createButton("Inside"))

      let resolveCheck: VoidFunction = () => {}
      const checkCanReturnFocus = () => new Promise<void>((resolve) => (resolveCheck = resolve))

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()
      trap.deactivate({ checkCanReturnFocus })

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(document.activeElement).not.toBe(trigger)

      resolveCheck()
      // Resolving goes through an extra `delay()` hop inside `finishDeactivation`,
      // so give it two ticks rather than one.
      await new Promise((resolve) => setTimeout(resolve, 0))
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(trigger)
    })
  })

  describe("resilience", () => {
    it("refocuses the initial node when the focused node is removed from the DOM", async () => {
      const container = createContainer()
      const first = createButton("First")
      const second = createButton("Second")
      container.append(first, second)

      const trap = track(new FocusTrap(container, { document, delayInitialFocus: false, fallbackFocus: container }))
      trap.activate()

      second.focus()
      expect(document.activeElement).toBe(second)

      second.remove()

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(document.activeElement).toBe(first)
    })
  })
})
