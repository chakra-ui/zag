type Modality = "keyboard" | "pointer"
type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent
type Handler = (modality: Modality, e: HandlerEvent) => void
type FocusVisibleCallback = (isFocusVisible: boolean) => void

let hasSetup = false
let modality: Modality | null = null
let hasEventBeforeFocus = false

const handlers = new Set<Handler>()

const isMac = typeof window !== "undefined" && window.navigator != null ? /^Mac/.test(window.navigator.platform) : false

function isValidKey(event: KeyboardEvent) {
  return !(event.metaKey || (!isMac && event.altKey) || event.ctrlKey)
}

function trigger(modality: Modality, event: HandlerEvent) {
  handlers.forEach((handler) => handler(modality, event))
}

function onKeyboardEvent(event: KeyboardEvent) {
  hasEventBeforeFocus = true
  if (isValidKey(event)) {
    modality = "keyboard"
    trigger("keyboard", event)
  }
}

function onPointerEvent(event: PointerEvent | MouseEvent) {
  modality = "pointer"
  if (event.type === "mousedown" || event.type === "pointerdown") {
    hasEventBeforeFocus = true
    trigger("pointer", event)
  }
}

function onWindowFocus(event: FocusEvent) {
  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  if (event.target === window || event.target === document) {
    return
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to keyboard modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus) {
    modality = "keyboard"
    trigger("keyboard", event)
  }

  hasEventBeforeFocus = false
}

function onWindowBlur() {
  // When the window is blurred, reset state. This is necessary when tabbing out of the window,
  // for example, since a subsequent focus event won't be fired.
  hasEventBeforeFocus = false
}

function isFocusVisible() {
  return modality !== "pointer"
}

function setupGlobalFocusEvents() {
  if (typeof window === "undefined" || hasSetup) {
    return
  }

  // Programmatic focus() calls shouldn't affect the current input modality.
  // However, we need to detect other cases when a focus event occurs without
  // a preceding user event (e.g. screen reader focus). Overriding the focus
  // method on HTMLElement.prototype is a bit hacky, but works.
  const { focus } = HTMLElement.prototype
  HTMLElement.prototype.focus = function focusElement(...args) {
    hasEventBeforeFocus = true
    focus.apply(this, args)
  }

  document.addEventListener("keydown", onKeyboardEvent, true)
  document.addEventListener("keyup", onKeyboardEvent, true)

  // Register focus events on the window so they are sure to happen
  // before React's event listeners (registered on the document).
  window.addEventListener("focus", onWindowFocus, true)
  window.addEventListener("blur", onWindowBlur, false)

  if (typeof PointerEvent !== "undefined") {
    document.addEventListener("pointerdown", onPointerEvent, true)
    document.addEventListener("pointermove", onPointerEvent, true)
    document.addEventListener("pointerup", onPointerEvent, true)
  } else {
    document.addEventListener("mousedown", onPointerEvent, true)
    document.addEventListener("mousemove", onPointerEvent, true)
    document.addEventListener("mouseup", onPointerEvent, true)
  }

  hasSetup = true
}

export function trackFocusVisible(fn: FocusVisibleCallback) {
  setupGlobalFocusEvents()

  fn(isFocusVisible())
  const handler = () => fn(isFocusVisible())

  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}
