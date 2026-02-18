/**
 * Credit: Huge props to the team at Adobe for inspiring this implementation.
 * https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useFocusVisible.ts
 */
import { getActiveElement, getDocument, getEventTarget, getWindow, isMac, isVirtualClick } from "@zag-js/dom-query"

function isValidKey(e: KeyboardEvent) {
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  )
}

const nonTextInputTypes = new Set(["checkbox", "radio", "range", "color", "file", "image", "button", "submit", "reset"])

function isKeyboardFocusEvent(isTextInput: boolean, modality: Modality, e: HandlerEvent) {
  const eventTarget = e ? getEventTarget<Element>(e) : null
  const doc = getDocument(eventTarget)
  const win = getWindow(eventTarget)

  // For keyboard events that occur on a non-input element that will move focus into input element
  // (e.g. ArrowLeft going from Datepicker button to the main input group), we need to rely on the
  // user passing isTextInput. Use activeElement to detect the element that will receive focus.
  const activeElement = getActiveElement(doc)
  isTextInput =
    isTextInput ||
    (activeElement instanceof win.HTMLInputElement && !nonTextInputTypes.has(activeElement?.type)) ||
    activeElement instanceof win.HTMLTextAreaElement ||
    (activeElement instanceof win.HTMLElement && activeElement.isContentEditable)

  return !(
    isTextInput &&
    modality === "keyboard" &&
    e instanceof win.KeyboardEvent &&
    !Reflect.has(FOCUS_VISIBLE_INPUT_KEYS, e.key)
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////

export type Modality = "keyboard" | "pointer" | "virtual"

type RootNode = Document | ShadowRoot | Node

type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent | null

type Handler = (modality: Modality, e: HandlerEvent) => void

/////////////////////////////////////////////////////////////////////////////////////////////

let currentModality: Modality | null = null

let changeHandlers = new Set<Handler>()

interface GlobalListenerData {
  focus: VoidFunction
}

export let listenerMap = new Map<Window, GlobalListenerData>()

let hasEventBeforeFocus = false
let hasBlurredWindowRecently = false

/**
 * When true, the next focus event will be ignored. Used by preventFocus() to avoid
 * focus rings when programmatically reverting focus.
 */
export let ignoreFocusEvent = false

// Only Tab or Esc keys will make focus visible on text input elements
const FOCUS_VISIBLE_INPUT_KEYS = {
  Tab: true,
  Escape: true,
}

function triggerChangeHandlers(modality: Modality, e: HandlerEvent) {
  for (let handler of changeHandlers) {
    handler(modality, e)
  }
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true
  if (isValidKey(e)) {
    currentModality = "keyboard"
    triggerChangeHandlers("keyboard", e)
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  currentModality = "pointer"
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true
    triggerChangeHandlers("pointer", e)
  }
}

function handleClickEvent(e: MouseEvent) {
  if (isVirtualClick(e)) {
    hasEventBeforeFocus = true
    currentModality = "virtual"
  }
}

function handleFocusEvent(e: FocusEvent) {
  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  const target = getEventTarget(e)

  if (
    target === getWindow(target as Element) ||
    target === getDocument(target as Element) ||
    ignoreFocusEvent ||
    !e.isTrusted
  ) {
    return
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual"
    triggerChangeHandlers("virtual", e)
  }

  hasEventBeforeFocus = false
  hasBlurredWindowRecently = false
}

function handleWindowBlur() {
  if (ignoreFocusEvent) return

  // When the window is blurred, reset state. This is necessary when tabbing out of the window,
  // for example, since a subsequent focus event won't be fired.
  hasEventBeforeFocus = false
  hasBlurredWindowRecently = true
}

/**
 * Setup global event listeners to control when keyboard focus style should be visible.
 */
function setupGlobalFocusEvents(root?: RootNode) {
  if (typeof window === "undefined" || listenerMap.get(getWindow(root))) {
    return
  }

  const win = getWindow(root)
  const doc = getDocument(root)

  let focus = win.HTMLElement.prototype.focus
  function patchedFocus(this: HTMLElement) {
    // For programmatic focus, we set hasEventBeforeFocus so the subsequent focus event
    // doesn't switch to virtual modality. This keeps modality as-is (e.g. "pointer" when
    // user clicked to open a dialog), preventing focus rings on autofocus/focus-trap.
    // When `options.focusVisible` is supported in most browsers, we can remove this.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#focusvisible
    hasEventBeforeFocus = true
    focus.apply(this, arguments as unknown as [options?: FocusOptions | undefined])
  }

  // Overwrite via assignment does not work in happy dom:
  // https://github.com/capricorn86/happy-dom/issues/1214
  try {
    Object.defineProperty(win.HTMLElement.prototype, "focus", {
      configurable: true,
      value: patchedFocus,
    })
  } catch {
    // Failed to patch - property may be non-configurable or already patched
    // The focus tracking will still work via keyboard/pointer event listeners
  }

  doc.addEventListener("keydown", handleKeyboardEvent, true)
  doc.addEventListener("keyup", handleKeyboardEvent, true)
  doc.addEventListener("click", handleClickEvent, true)

  win.addEventListener("focus", handleFocusEvent, true)
  win.addEventListener("blur", handleWindowBlur, false)

  if (typeof win.PointerEvent !== "undefined") {
    doc.addEventListener("pointerdown", handlePointerEvent, true)
    doc.addEventListener("pointermove", handlePointerEvent, true)
    doc.addEventListener("pointerup", handlePointerEvent, true)
  } else {
    doc.addEventListener("mousedown", handlePointerEvent, true)
    doc.addEventListener("mousemove", handlePointerEvent, true)
    doc.addEventListener("mouseup", handlePointerEvent, true)
  }

  // Add unmount handler
  win.addEventListener(
    "beforeunload",
    () => {
      tearDownWindowFocusTracking(root)
    },
    { once: true },
  )

  listenerMap.set(win, { focus })
}

const tearDownWindowFocusTracking = (root?: RootNode, loadListener?: () => void) => {
  const win = getWindow(root)
  const doc = getDocument(root)

  if (loadListener) {
    doc.removeEventListener("DOMContentLoaded", loadListener)
  }

  const listenerData = listenerMap.get(win)
  if (!listenerData) {
    return
  }

  try {
    Object.defineProperty(win.HTMLElement.prototype, "focus", {
      configurable: true,
      value: listenerData.focus,
    })
  } catch {
    // Failed to restore - ignore silently
  }

  doc.removeEventListener("keydown", handleKeyboardEvent, true)
  doc.removeEventListener("keyup", handleKeyboardEvent, true)
  doc.removeEventListener("click", handleClickEvent, true)
  win.removeEventListener("focus", handleFocusEvent, true)
  win.removeEventListener("blur", handleWindowBlur, false)

  if (typeof win.PointerEvent !== "undefined") {
    doc.removeEventListener("pointerdown", handlePointerEvent, true)
    doc.removeEventListener("pointermove", handlePointerEvent, true)
    doc.removeEventListener("pointerup", handlePointerEvent, true)
  } else {
    doc.removeEventListener("mousedown", handlePointerEvent, true)
    doc.removeEventListener("mousemove", handlePointerEvent, true)
    doc.removeEventListener("mouseup", handlePointerEvent, true)
  }

  listenerMap.delete(win)
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function getInteractionModality(): Modality | null {
  return currentModality
}

export function setInteractionModality(modality: Modality) {
  currentModality = modality
  triggerChangeHandlers(modality, null)
}

export interface InteractionModalityChangeDetails {
  /** The modality of the interaction that caused the focus to be visible. */
  modality: Modality | null
}

export interface InteractionModalityProps {
  /** The root element to track focus visibility for. */
  root?: RootNode | undefined
  /** Callback to be called when the interaction modality changes. */
  onChange: (details: InteractionModalityChangeDetails) => void
}

export function trackInteractionModality(props: InteractionModalityProps): VoidFunction {
  const { onChange, root } = props

  setupGlobalFocusEvents(root)

  onChange({ modality: currentModality })

  const handler = () => onChange({ modality: currentModality })

  changeHandlers.add(handler)
  return () => {
    changeHandlers.delete(handler)
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function isFocusVisible(): boolean {
  // Focus is visible for keyboard and virtual (e.g. screen reader) modalities only.
  // Excludes pointer (click/touch) and null (no prior interaction, e.g. focus-trap autofocus).
  return currentModality === "keyboard" || currentModality === "virtual"
}

export interface FocusVisibleChangeDetails {
  /** Whether keyboard focus is visible globally. */
  isFocusVisible: boolean
  /** The modality of the interaction that caused the focus to be visible. */
  modality: Modality | null
}

export interface FocusVisibleProps {
  /** The root element to track focus visibility for. */
  root?: RootNode | undefined
  /** Whether the element is a text input. */
  isTextInput?: boolean | undefined
  /** Whether the element will be auto focused. */
  autoFocus?: boolean | undefined
  /** Callback to be called when the focus visibility changes. */
  onChange?: ((details: FocusVisibleChangeDetails) => void) | undefined
}

export function trackFocusVisible(props: FocusVisibleProps = {}): VoidFunction {
  const { isTextInput, autoFocus, onChange, root } = props

  setupGlobalFocusEvents(root)

  onChange?.({ isFocusVisible: autoFocus || isFocusVisible(), modality: currentModality })

  const handler = (modality: Modality, e: HandlerEvent) => {
    if (!isKeyboardFocusEvent(!!isTextInput, modality, e)) return
    onChange?.({ isFocusVisible: isFocusVisible(), modality })
  }

  changeHandlers.add(handler)

  return () => {
    changeHandlers.delete(handler)
  }
}
