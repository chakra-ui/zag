import type * as CSS from "csstype"

type NativeAnimationEvent = AnimationEvent
type NativeClipboardEvent = ClipboardEvent
type NativeCompositionEvent = CompositionEvent
type NativeDragEvent = DragEvent
type NativeFocusEvent = FocusEvent
type NativeKeyboardEvent = KeyboardEvent
type NativeMouseEvent = MouseEvent
type NativeTouchEvent = TouchEvent
type NativePointerEvent = PointerEvent
type NativeTransitionEvent = TransitionEvent
type NativeUIEvent = UIEvent
type NativeWheelEvent = WheelEvent
type Booleanish = boolean | "true" | "false"

export namespace JSX {
  export interface BaseSyntheticEvent<E = object, C = any, T = any> {
    nativeEvent: E
    currentTarget: C
    target: T
    bubbles: boolean
    cancelable: boolean
    defaultPrevented: boolean
    eventPhase: number
    isTrusted: boolean
    preventDefault(): void
    isDefaultPrevented(): boolean
    stopPropagation(): void
    isPropagationStopped(): boolean
    persist(): void
    timeStamp: number
    type: string
  }

  export interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

  export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, NativeClipboardEvent> {
    clipboardData: DataTransfer
  }

  export interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
    data: string
  }

  export interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
    dataTransfer: DataTransfer
  }

  export interface PointerEvent<T = Element> extends MouseEvent<T, NativePointerEvent> {
    pointerId: number
    pressure: number
    tangentialPressure: number
    tiltX: number
    tiltY: number
    twist: number
    width: number
    height: number
    pointerType: "mouse" | "pen" | "touch"
    isPrimary: boolean
  }

  export interface FocusEvent<Target = Element, RelatedTarget = Element>
    extends SyntheticEvent<Target, NativeFocusEvent> {
    relatedTarget: (EventTarget & RelatedTarget) | null
    target: EventTarget & Target
  }

  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  export interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T
  }

  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T
  }

  export interface KeyboardEvent<T = Element> extends UIEvent<T, NativeKeyboardEvent> {
    altKey: boolean
    /** @deprecated */
    charCode: number
    ctrlKey: boolean
    code: string
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean
    /**
     * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
     */
    key: string
    /** @deprecated */
    keyCode: number
    locale: string
    location: number
    metaKey: boolean
    repeat: boolean
    shiftKey: boolean
    /** @deprecated */
    which: number
  }

  export interface MouseEvent<T = Element, E = NativeMouseEvent> extends UIEvent<T, E> {
    altKey: boolean
    button: number
    buttons: number
    clientX: number
    clientY: number
    ctrlKey: boolean
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean
    metaKey: boolean
    movementX: number
    movementY: number
    pageX: number
    pageY: number
    relatedTarget: EventTarget | null
    screenX: number
    screenY: number
    shiftKey: boolean
  }

  export interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
    altKey: boolean
    changedTouches: TouchList
    ctrlKey: boolean
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean
    metaKey: boolean
    shiftKey: boolean
    targetTouches: TouchList
    touches: TouchList
  }

  export interface AbstractView {
    document: Document
    styleMedia: StyleMedia
  }

  export interface UIEvent<T = Element, E = NativeUIEvent> extends SyntheticEvent<T, E> {
    detail: number
    view: AbstractView
  }

  export interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
    deltaMode: number
    deltaX: number
    deltaY: number
    deltaZ: number
  }

  export interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
    animationName: string
    elapsedTime: number
    pseudoElement: string
  }

  export interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
    elapsedTime: number
    propertyName: string
    pseudoElement: string
  }

  //
  // Event Handler Types
  // ----------------------------------------------------------------------

  type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"]

  type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>

  type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>
  type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>
  type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>
  type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>
  type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>
  type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>
  type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>
  type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>
  type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>
  type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>
  type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>
  type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>
  type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>
  type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>

  //
  // Props / DOM Attributes
  // ----------------------------------------------------------------------

  export interface HTMLProps<T> extends AllHTMLAttributes<T> {}

  export interface DOMAttributes<T> {
    children?: string | undefined
    // Clipboard Events
    onCopy?: ClipboardEventHandler<T> | undefined
    onCut?: ClipboardEventHandler<T> | undefined
    onPaste?: ClipboardEventHandler<T> | undefined

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<T> | undefined
    onCompositionStart?: CompositionEventHandler<T> | undefined
    onCompositionUpdate?: CompositionEventHandler<T> | undefined

    // Focus Events
    onFocus?: FocusEventHandler<T> | undefined
    onBlur?: FocusEventHandler<T> | undefined

    // Form Events
    onChange?: FormEventHandler<T> | undefined
    onBeforeInput?: FormEventHandler<T> | undefined
    onInput?: FormEventHandler<T> | undefined
    onReset?: FormEventHandler<T> | undefined
    onSubmit?: FormEventHandler<T> | undefined
    onInvalid?: FormEventHandler<T> | undefined

    // Image Events
    onLoad?: ReactEventHandler<T> | undefined
    onError?: ReactEventHandler<T> | undefined
    onKeyDown?: KeyboardEventHandler<T> | undefined
    onKeyUp?: KeyboardEventHandler<T> | undefined

    // Media Events
    onAbort?: ReactEventHandler<T> | undefined
    onCanPlay?: ReactEventHandler<T> | undefined
    onCanPlayThrough?: ReactEventHandler<T> | undefined
    onDurationChange?: ReactEventHandler<T> | undefined
    onEmptied?: ReactEventHandler<T> | undefined
    onEncrypted?: ReactEventHandler<T> | undefined
    onEnded?: ReactEventHandler<T> | undefined
    onLoadedData?: ReactEventHandler<T> | undefined
    onLoadedMetadata?: ReactEventHandler<T> | undefined
    onLoadStart?: ReactEventHandler<T> | undefined
    onPause?: ReactEventHandler<T> | undefined
    onPlay?: ReactEventHandler<T> | undefined
    onPlaying?: ReactEventHandler<T> | undefined
    onProgress?: ReactEventHandler<T> | undefined
    onRateChange?: ReactEventHandler<T> | undefined
    onSeeked?: ReactEventHandler<T> | undefined
    onSeeking?: ReactEventHandler<T> | undefined
    onStalled?: ReactEventHandler<T> | undefined
    onSuspend?: ReactEventHandler<T> | undefined
    onTimeUpdate?: ReactEventHandler<T> | undefined
    onVolumeChange?: ReactEventHandler<T> | undefined
    onWaiting?: ReactEventHandler<T> | undefined

    // MouseEvents
    onAuxClick?: MouseEventHandler<T> | undefined
    onClick?: MouseEventHandler<T> | undefined
    onContextMenu?: MouseEventHandler<T> | undefined
    onDoubleClick?: MouseEventHandler<T> | undefined
    onDrag?: DragEventHandler<T> | undefined
    onDragEnd?: DragEventHandler<T> | undefined
    onDragEnter?: DragEventHandler<T> | undefined
    onDragExit?: DragEventHandler<T> | undefined
    onDragLeave?: DragEventHandler<T> | undefined
    onDragOver?: DragEventHandler<T> | undefined
    onDragStart?: DragEventHandler<T> | undefined
    onDrop?: DragEventHandler<T> | undefined
    onMouseDown?: MouseEventHandler<T> | undefined
    onMouseEnter?: MouseEventHandler<T> | undefined
    onMouseLeave?: MouseEventHandler<T> | undefined
    onMouseMove?: MouseEventHandler<T> | undefined
    onMouseOut?: MouseEventHandler<T> | undefined
    onMouseOver?: MouseEventHandler<T> | undefined
    onMouseUp?: MouseEventHandler<T> | undefined

    // Selection Events
    onSelect?: ReactEventHandler<T> | undefined

    // Touch Events
    onTouchCancel?: TouchEventHandler<T> | undefined
    onTouchEnd?: TouchEventHandler<T> | undefined
    onTouchMove?: TouchEventHandler<T> | undefined
    onTouchStart?: TouchEventHandler<T> | undefined

    // Pointer Events
    onPointerDown?: PointerEventHandler<T> | undefined
    onPointerMove?: PointerEventHandler<T> | undefined
    onPointerUp?: PointerEventHandler<T> | undefined
    onPointerCancel?: PointerEventHandler<T> | undefined
    onPointerEnter?: PointerEventHandler<T> | undefined
    onPointerLeave?: PointerEventHandler<T> | undefined
    onPointerOver?: PointerEventHandler<T> | undefined
    onPointerOut?: PointerEventHandler<T> | undefined

    // UI Events
    onScroll?: UIEventHandler<T> | undefined

    // Wheel Events
    onWheel?: WheelEventHandler<T> | undefined

    // Animation Events
    onAnimationStart?: AnimationEventHandler<T> | undefined
    onAnimationEnd?: AnimationEventHandler<T> | undefined
    onAnimationIteration?: AnimationEventHandler<T> | undefined

    // Transition Events
    onTransitionEnd?: TransitionEventHandler<T> | undefined
  }

  export interface CSSProperties extends CSS.Properties<string | number> {
    [prop: string]: string | number | undefined
  }

  // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
  export interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    "aria-activedescendant"?: string | undefined
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    "aria-atomic"?: Booleanish | undefined
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    "aria-busy"?: Booleanish | undefined
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    "aria-colcount"?: number | undefined
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    "aria-colindex"?: number | undefined
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    "aria-colspan"?: number | undefined
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    "aria-controls"?: string | undefined
    /** Indicates the element that represents the current item within a container or set of related elements. */
    "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    "aria-describedby"?: string | undefined
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    "aria-details"?: string | undefined
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    "aria-disabled"?: Booleanish | undefined
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    "aria-errormessage"?: string | undefined
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    "aria-expanded"?: Booleanish | undefined
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    "aria-flowto"?: string | undefined
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    "aria-grabbed"?: Booleanish | undefined
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    "aria-hidden"?: Booleanish | undefined
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    "aria-keyshortcuts"?: string | undefined
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    "aria-label"?: string | undefined
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    "aria-labelledby"?: string | undefined
    /** Defines the hierarchical level of an element within a structure. */
    "aria-level"?: number | undefined
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    "aria-live"?: "off" | "assertive" | "polite" | undefined
    /** Indicates whether an element is modal when displayed. */
    "aria-modal"?: Booleanish | undefined
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    "aria-multiline"?: Booleanish | undefined
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    "aria-multiselectable"?: Booleanish | undefined
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    "aria-orientation"?: "horizontal" | "vertical" | undefined
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    "aria-owns"?: string | undefined
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    "aria-placeholder"?: string | undefined
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    "aria-posinset"?: number | undefined
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    "aria-readonly"?: Booleanish | undefined
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    "aria-relevant"?:
      | "additions"
      | "additions removals"
      | "additions text"
      | "all"
      | "removals"
      | "removals additions"
      | "removals text"
      | "text"
      | "text additions"
      | "text removals"
      | undefined
    /** Indicates that user input is required on the element before a form may be submitted. */
    "aria-required"?: Booleanish | undefined
    /** Defines a human-readable, author-localized description for the role of an element. */
    "aria-roledescription"?: string | undefined
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    "aria-rowcount"?: number | undefined
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    "aria-rowindex"?: number | undefined
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    "aria-rowspan"?: number | undefined
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    "aria-selected"?: Booleanish | undefined
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    "aria-setsize"?: number | undefined
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined
    /** Defines the maximum allowed value for a range widget. */
    "aria-valuemax"?: number | undefined
    /** Defines the minimum allowed value for a range widget. */
    "aria-valuemin"?: number | undefined
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    "aria-valuenow"?: number | undefined
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    "aria-valuetext"?: string | undefined
  }

  // All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
  type AriaRole =
    | "alert"
    | "alertdialog"
    | "application"
    | "article"
    | "banner"
    | "button"
    | "cell"
    | "checkbox"
    | "columnheader"
    | "combobox"
    | "complementary"
    | "contentinfo"
    | "definition"
    | "dialog"
    | "directory"
    | "document"
    | "feed"
    | "figure"
    | "form"
    | "grid"
    | "gridcell"
    | "group"
    | "heading"
    | "img"
    | "link"
    | "list"
    | "listbox"
    | "listitem"
    | "log"
    | "main"
    | "marquee"
    | "math"
    | "menu"
    | "menubar"
    | "menuitem"
    | "menuitemcheckbox"
    | "menuitemradio"
    | "navigation"
    | "none"
    | "note"
    | "option"
    | "presentation"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "region"
    | "row"
    | "rowgroup"
    | "rowheader"
    | "scrollbar"
    | "search"
    | "searchbox"
    | "separator"
    | "slider"
    | "spinbutton"
    | "status"
    | "switch"
    | "tab"
    | "table"
    | "tablist"
    | "tabpanel"
    | "term"
    | "textbox"
    | "timer"
    | "toolbar"
    | "tooltip"
    | "tree"
    | "treegrid"
    | "treeitem"
    | (string & {})

  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // React-specific Attributes
    defaultChecked?: boolean | undefined
    defaultValue?: string | number | ReadonlyArray<string> | undefined
    suppressContentEditableWarning?: boolean | undefined
    suppressHydrationWarning?: boolean | undefined

    // Standard HTML Attributes
    accessKey?: string | undefined
    className?: string | undefined
    contentEditable?: Booleanish | "inherit" | undefined
    contextMenu?: string | undefined
    dir?: string | undefined
    draggable?: Booleanish | undefined
    hidden?: boolean | undefined
    id?: string | undefined
    lang?: string | undefined
    placeholder?: string | undefined
    slot?: string | undefined
    spellCheck?: Booleanish | undefined
    style?: CSSProperties | undefined
    tabIndex?: number | undefined
    title?: string | undefined
    translate?: "yes" | "no" | undefined

    // Unknown
    radioGroup?: string | undefined // <command>

    // WAI-ARIA
    role?: AriaRole | undefined

    // RDFa Attributes
    about?: string | undefined
    datatype?: string | undefined
    inlist?: any
    prefix?: string | undefined
    property?: string | undefined
    resource?: string | undefined
    typeof?: string | undefined
    vocab?: string | undefined

    // Non-standard Attributes
    autoCapitalize?: string | undefined
    autoCorrect?: string | undefined
    autoSave?: string | undefined
    color?: string | undefined
    itemProp?: string | undefined
    itemScope?: boolean | undefined
    itemType?: string | undefined
    itemID?: string | undefined
    itemRef?: string | undefined
    results?: number | undefined
    security?: string | undefined
    unselectable?: "on" | "off" | undefined

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | undefined
  }

  export interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    // Standard HTML Attributes
    accept?: string | undefined
    acceptCharset?: string | undefined
    action?: string | undefined
    allowFullScreen?: boolean | undefined
    allowTransparency?: boolean | undefined
    alt?: string | undefined
    as?: string | undefined
    async?: boolean | undefined
    autoComplete?: string | undefined
    autoFocus?: boolean | undefined
    autoPlay?: boolean | undefined
    capture?: boolean | "user" | "environment" | undefined
    cellPadding?: number | string | undefined
    cellSpacing?: number | string | undefined
    charSet?: string | undefined
    challenge?: string | undefined
    checked?: boolean | undefined
    cite?: string | undefined
    classID?: string | undefined
    cols?: number | undefined
    colSpan?: number | undefined
    content?: string | undefined
    controls?: boolean | undefined
    coords?: string | undefined
    crossOrigin?: string | undefined
    data?: string | undefined
    dateTime?: string | undefined
    default?: boolean | undefined
    defer?: boolean | undefined
    disabled?: boolean | undefined
    download?: any
    encType?: string | undefined
    form?: string | undefined
    formAction?: string | undefined
    formEncType?: string | undefined
    formMethod?: string | undefined
    formNoValidate?: boolean | undefined
    formTarget?: string | undefined
    frameBorder?: number | string | undefined
    headers?: string | undefined
    height?: number | string | undefined
    high?: number | undefined
    href?: string | undefined
    hrefLang?: string | undefined
    htmlFor?: string | undefined
    httpEquiv?: string | undefined
    integrity?: string | undefined
    keyParams?: string | undefined
    keyType?: string | undefined
    kind?: string | undefined
    label?: string | undefined
    list?: string | undefined
    loop?: boolean | undefined
    low?: number | undefined
    manifest?: string | undefined
    marginHeight?: number | undefined
    marginWidth?: number | undefined
    max?: number | string | undefined
    maxLength?: number | undefined
    media?: string | undefined
    mediaGroup?: string | undefined
    method?: string | undefined
    min?: number | string | undefined
    minLength?: number | undefined
    multiple?: boolean | undefined
    muted?: boolean | undefined
    name?: string | undefined
    nonce?: string | undefined
    noValidate?: boolean | undefined
    open?: boolean | undefined
    optimum?: number | undefined
    pattern?: string | undefined
    placeholder?: string | undefined
    playsInline?: boolean | undefined
    poster?: string | undefined
    preload?: string | undefined
    readOnly?: boolean | undefined
    rel?: string | undefined
    required?: boolean | undefined
    reversed?: boolean | undefined
    rows?: number | undefined
    rowSpan?: number | undefined
    sandbox?: string | undefined
    scope?: string | undefined
    scoped?: boolean | undefined
    scrolling?: string | undefined
    seamless?: boolean | undefined
    selected?: boolean | undefined
    shape?: string | undefined
    size?: number | undefined
    sizes?: string | undefined
    span?: number | undefined
    src?: string | undefined
    srcDoc?: string | undefined
    srcLang?: string | undefined
    srcSet?: string | undefined
    start?: number | undefined
    step?: number | string | undefined
    summary?: string | undefined
    target?: string | undefined
    type?: string | undefined
    useMap?: string | undefined
    value?: string | ReadonlyArray<string> | number | undefined
    width?: number | string | undefined
    wmode?: string | undefined
    wrap?: string | undefined
  }

  type HTMLAttributeReferrerPolicy =
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"

  type HTMLAttributeAnchorTarget = "_self" | "_blank" | "_parent" | "_top" | (string & {})

  export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    download?: any
    href?: string | undefined
    hrefLang?: string | undefined
    media?: string | undefined
    ping?: string | undefined
    rel?: string | undefined
    target?: HTMLAttributeAnchorTarget | undefined
    type?: string | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
  }

  export interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

  export interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined
    coords?: string | undefined
    download?: any
    href?: string | undefined
    hrefLang?: string | undefined
    media?: string | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
    rel?: string | undefined
    shape?: string | undefined
    target?: string | undefined
  }

  export interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string | undefined
    target?: string | undefined
  }

  export interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | undefined
    disabled?: boolean | undefined
    form?: string | undefined
    formAction?: string | undefined
    formEncType?: string | undefined
    formMethod?: string | undefined
    formNoValidate?: boolean | undefined
    formTarget?: string | undefined
    name?: string | undefined
    type?: "submit" | "reset" | "button" | undefined
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined
    width?: number | string | undefined
  }

  export interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined
    width?: number | string | undefined
  }

  export interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined
  }

  export interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean | undefined
    onToggle?: ReactEventHandler<T> | undefined
  }

  export interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined
    dateTime?: string | undefined
  }

  export interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    onCancel?: ReactEventHandler<T> | undefined
    onClose?: ReactEventHandler<T> | undefined
    open?: boolean | undefined
  }

  export interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined
    src?: string | undefined
    type?: string | undefined
    width?: number | string | undefined
  }

  export interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined
    form?: string | undefined
    name?: string | undefined
  }

  export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: string | undefined
    action?: string | undefined
    autoComplete?: string | undefined
    encType?: string | undefined
    method?: string | undefined
    name?: string | undefined
    noValidate?: boolean | undefined
    target?: string | undefined
  }

  export interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: string | undefined
  }

  export interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: string | undefined
    allowFullScreen?: boolean | undefined
    allowTransparency?: boolean | undefined
    /** @deprecated */
    frameBorder?: number | string | undefined
    height?: number | string | undefined
    loading?: "eager" | "lazy" | undefined
    /** @deprecated */
    marginHeight?: number | undefined
    /** @deprecated */
    marginWidth?: number | undefined
    name?: string | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
    sandbox?: string | undefined
    /** @deprecated */
    scrolling?: string | undefined
    seamless?: boolean | undefined
    src?: string | undefined
    srcDoc?: string | undefined
    width?: number | string | undefined
  }

  export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined
    crossOrigin?: "anonymous" | "use-credentials" | "" | undefined
    decoding?: "async" | "auto" | "sync" | undefined
    height?: number | string | undefined
    loading?: "eager" | "lazy" | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
    sizes?: string | undefined
    src?: string | undefined
    srcSet?: string | undefined
    useMap?: string | undefined
    width?: number | string | undefined
  }

  export interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined
    dateTime?: string | undefined
  }

  type HTMLInputTypeAttribute =
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week"
    | (string & {})

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: string | undefined
    alt?: string | undefined
    autoComplete?: string | undefined
    autoFocus?: boolean | undefined
    capture?: boolean | "user" | "environment" | undefined // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
    checked?: boolean | undefined
    crossOrigin?: string | undefined
    disabled?: boolean | undefined
    enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined
    form?: string | undefined
    formAction?: string | undefined
    formEncType?: string | undefined
    formMethod?: string | undefined
    formNoValidate?: boolean | undefined
    formTarget?: string | undefined
    height?: number | string | undefined
    list?: string | undefined
    max?: number | string | undefined
    maxLength?: number | undefined
    min?: number | string | undefined
    minLength?: number | undefined
    multiple?: boolean | undefined
    name?: string | undefined
    pattern?: string | undefined
    placeholder?: string | undefined
    readOnly?: boolean | undefined
    required?: boolean | undefined
    size?: number | undefined
    src?: string | undefined
    step?: number | string | undefined
    type?: HTMLInputTypeAttribute | undefined
    value?: string | ReadonlyArray<string> | number | undefined
    width?: number | string | undefined

    onChange?: ChangeEventHandler<T> | undefined
  }

  export interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | undefined
    challenge?: string | undefined
    disabled?: boolean | undefined
    form?: string | undefined
    keyType?: string | undefined
    keyParams?: string | undefined
    name?: string | undefined
  }

  export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined
    htmlFor?: string | undefined
  }

  export interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: string | undefined
    crossOrigin?: string | undefined
    href?: string | undefined
    hrefLang?: string | undefined
    integrity?: string | undefined
    media?: string | undefined
    imageSrcSet?: string | undefined
    imageSizes?: string | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
    rel?: string | undefined
    sizes?: string | undefined
    type?: string | undefined
    charSet?: string | undefined
  }

  export interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined
  }

  export interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string | undefined
  }

  export interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: boolean | undefined
    controls?: boolean | undefined
    controlsList?: string | undefined
    crossOrigin?: string | undefined
    loop?: boolean | undefined
    mediaGroup?: string | undefined
    muted?: boolean | undefined
    playsInline?: boolean | undefined
    preload?: string | undefined
    src?: string | undefined
  }

  export interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: string | undefined
    content?: string | undefined
    httpEquiv?: string | undefined
    name?: string | undefined
    media?: string | undefined
  }

  export interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined
    high?: number | undefined
    low?: number | undefined
    max?: number | string | undefined
    min?: number | string | undefined
    optimum?: number | undefined
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined
  }

  export interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: string | undefined
    data?: string | undefined
    form?: string | undefined
    height?: number | string | undefined
    name?: string | undefined
    type?: string | undefined
    useMap?: string | undefined
    width?: number | string | undefined
    wmode?: string | undefined
  }

  export interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: boolean | undefined
    start?: number | undefined
    type?: "1" | "a" | "A" | "i" | "I" | undefined
  }

  export interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined
    label?: string | undefined
  }

  export interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined
    label?: string | undefined
    selected?: boolean | undefined
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined
    htmlFor?: string | undefined
    name?: string | undefined
  }

  export interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: number | string | undefined
    value?: string | ReadonlyArray<string> | number | undefined
  }

  export interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined
  }

  export interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean | undefined
    /** @deprecated */
    charSet?: string | undefined
    crossOrigin?: string | undefined
    defer?: boolean | undefined
    integrity?: string | undefined
    noModule?: boolean | undefined
    nonce?: string | undefined
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
    src?: string | undefined
    type?: string | undefined
  }

  export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined
    autoFocus?: boolean | undefined
    disabled?: boolean | undefined
    form?: string | undefined
    multiple?: boolean | undefined
    name?: string | undefined
    required?: boolean | undefined
    size?: number | undefined
    value?: string | ReadonlyArray<string> | number | undefined
    onChange?: ChangeEventHandler<T> | undefined
  }

  export interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined
    media?: string | undefined
    sizes?: string | undefined
    src?: string | undefined
    srcSet?: string | undefined
    type?: string | undefined
    width?: number | string | undefined
  }

  export interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string | undefined
    nonce?: string | undefined
    scoped?: boolean | undefined
    type?: string | undefined
  }

  export interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | undefined
    bgcolor?: string | undefined
    border?: number | undefined
    cellPadding?: number | string | undefined
    cellSpacing?: number | string | undefined
    frame?: boolean | undefined
    rules?: "none" | "groups" | "rows" | "columns" | "all" | undefined
    summary?: string | undefined
    width?: number | string | undefined
  }

  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined
    autoFocus?: boolean | undefined
    cols?: number | undefined
    dirName?: string | undefined
    disabled?: boolean | undefined
    form?: string | undefined
    maxLength?: number | undefined
    minLength?: number | undefined
    name?: string | undefined
    placeholder?: string | undefined
    readOnly?: boolean | undefined
    required?: boolean | undefined
    rows?: number | undefined
    value?: string | ReadonlyArray<string> | number | undefined
    wrap?: string | undefined

    onChange?: ChangeEventHandler<T> | undefined
  }

  export interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char" | undefined
    colSpan?: number | undefined
    headers?: string | undefined
    rowSpan?: number | undefined
    scope?: string | undefined
    abbr?: string | undefined
    height?: number | string | undefined
    width?: number | string | undefined
    valign?: "top" | "middle" | "bottom" | "baseline" | undefined
  }

  export interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char" | undefined
    colSpan?: number | undefined
    headers?: string | undefined
    rowSpan?: number | undefined
    scope?: string | undefined
    abbr?: string | undefined
  }

  export interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: string | undefined
  }

  export interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: boolean | undefined
    kind?: string | undefined
    label?: string | undefined
    src?: string | undefined
    srcLang?: string | undefined
  }

  export interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string | undefined
    playsInline?: boolean | undefined
    poster?: string | undefined
    width?: number | string | undefined
    disablePictureInPicture?: boolean | undefined
    disableRemotePlayback?: boolean | undefined
  }

  export interface IntrinsicElements {
    // HTML
    a: AnchorHTMLAttributes<HTMLAnchorElement>
    abbr: HTMLAttributes<HTMLElement>
    address: HTMLAttributes<HTMLElement>
    area: AreaHTMLAttributes<HTMLAreaElement>
    article: HTMLAttributes<HTMLElement>
    aside: HTMLAttributes<HTMLElement>
    audio: AudioHTMLAttributes<HTMLAudioElement>
    b: HTMLAttributes<HTMLElement>
    base: BaseHTMLAttributes<HTMLBaseElement>
    bdi: HTMLAttributes<HTMLElement>
    bdo: HTMLAttributes<HTMLElement>
    big: HTMLAttributes<HTMLElement>
    blockquote: BlockquoteHTMLAttributes<HTMLQuoteElement>
    body: HTMLAttributes<HTMLBodyElement>
    br: HTMLAttributes<HTMLBRElement>
    button: ButtonHTMLAttributes<HTMLButtonElement>
    canvas: CanvasHTMLAttributes<HTMLCanvasElement>
    caption: HTMLAttributes<HTMLElement>
    cite: HTMLAttributes<HTMLElement>
    code: HTMLAttributes<HTMLElement>
    col: ColHTMLAttributes<HTMLTableColElement>
    colgroup: ColgroupHTMLAttributes<HTMLTableColElement>
    data: DataHTMLAttributes<HTMLDataElement>
    datalist: HTMLAttributes<HTMLDataListElement>
    dd: HTMLAttributes<HTMLElement>
    del: DelHTMLAttributes<HTMLModElement>
    details: DetailsHTMLAttributes<HTMLDetailsElement>
    dfn: HTMLAttributes<HTMLElement>
    dialog: DialogHTMLAttributes<HTMLDialogElement>
    div: HTMLAttributes<HTMLDivElement>
    dl: HTMLAttributes<HTMLDListElement>
    dt: HTMLAttributes<HTMLElement>
    em: HTMLAttributes<HTMLElement>
    embed: EmbedHTMLAttributes<HTMLEmbedElement>
    fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>
    figcaption: HTMLAttributes<HTMLElement>
    figure: HTMLAttributes<HTMLElement>
    footer: HTMLAttributes<HTMLElement>
    form: FormHTMLAttributes<HTMLFormElement>
    h1: HTMLAttributes<HTMLHeadingElement>
    h2: HTMLAttributes<HTMLHeadingElement>
    h3: HTMLAttributes<HTMLHeadingElement>
    h4: HTMLAttributes<HTMLHeadingElement>
    h5: HTMLAttributes<HTMLHeadingElement>
    h6: HTMLAttributes<HTMLHeadingElement>
    head: HTMLAttributes<HTMLHeadElement>
    header: HTMLAttributes<HTMLElement>
    hgroup: HTMLAttributes<HTMLElement>
    hr: HTMLAttributes<HTMLHRElement>
    html: HtmlHTMLAttributes<HTMLHtmlElement>
    i: HTMLAttributes<HTMLElement>
    iframe: IframeHTMLAttributes<HTMLIFrameElement>
    img: ImgHTMLAttributes<HTMLImageElement>
    input: InputHTMLAttributes<HTMLInputElement>
    ins: InsHTMLAttributes<HTMLModElement>
    kbd: HTMLAttributes<HTMLElement>
    keygen: KeygenHTMLAttributes<HTMLElement>
    label: LabelHTMLAttributes<HTMLLabelElement>
    legend: HTMLAttributes<HTMLLegendElement>
    li: LiHTMLAttributes<HTMLLIElement>
    link: LinkHTMLAttributes<HTMLLinkElement>
    main: HTMLAttributes<HTMLElement>
    map: MapHTMLAttributes<HTMLMapElement>
    mark: HTMLAttributes<HTMLElement>
    menu: MenuHTMLAttributes<HTMLElement>
    menuitem: HTMLAttributes<HTMLElement>
    meta: MetaHTMLAttributes<HTMLMetaElement>
    meter: MeterHTMLAttributes<HTMLMeterElement>
    nav: HTMLAttributes<HTMLElement>
    noindex: HTMLAttributes<HTMLElement>
    noscript: HTMLAttributes<HTMLElement>
    object: ObjectHTMLAttributes<HTMLObjectElement>
    ol: OlHTMLAttributes<HTMLOListElement>
    optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>
    option: OptionHTMLAttributes<HTMLOptionElement>
    output: OutputHTMLAttributes<HTMLOutputElement>
    p: HTMLAttributes<HTMLParagraphElement>
    param: ParamHTMLAttributes<HTMLParamElement>
    picture: HTMLAttributes<HTMLElement>
    pre: HTMLAttributes<HTMLPreElement>
    progress: ProgressHTMLAttributes<HTMLProgressElement>
    q: QuoteHTMLAttributes<HTMLQuoteElement>
    rp: HTMLAttributes<HTMLElement>
    rt: HTMLAttributes<HTMLElement>
    ruby: HTMLAttributes<HTMLElement>
    s: HTMLAttributes<HTMLElement>
    samp: HTMLAttributes<HTMLElement>
    slot: SlotHTMLAttributes<HTMLSlotElement>
    script: ScriptHTMLAttributes<HTMLScriptElement>
    section: HTMLAttributes<HTMLElement>
    select: SelectHTMLAttributes<HTMLSelectElement>
    small: HTMLAttributes<HTMLElement>
    source: SourceHTMLAttributes<HTMLSourceElement>
    span: HTMLAttributes<HTMLSpanElement>
    strong: HTMLAttributes<HTMLElement>
    style: StyleHTMLAttributes<HTMLStyleElement>
    sub: HTMLAttributes<HTMLElement>
    summary: HTMLAttributes<HTMLElement>
    sup: HTMLAttributes<HTMLElement>
    table: TableHTMLAttributes<HTMLTableElement>
    template: HTMLAttributes<HTMLTemplateElement>
    tbody: HTMLAttributes<HTMLTableSectionElement>
    td: TdHTMLAttributes<HTMLTableDataCellElement>
    textarea: TextareaHTMLAttributes<HTMLTextAreaElement>
    tfoot: HTMLAttributes<HTMLTableSectionElement>
    th: ThHTMLAttributes<HTMLTableHeaderCellElement>
    thead: HTMLAttributes<HTMLTableSectionElement>
    time: TimeHTMLAttributes<HTMLTimeElement>
    title: HTMLAttributes<HTMLTitleElement>
    tr: HTMLAttributes<HTMLTableRowElement>
    track: TrackHTMLAttributes<HTMLTrackElement>
    u: HTMLAttributes<HTMLElement>
    ul: HTMLAttributes<HTMLUListElement>
    var: HTMLAttributes<HTMLElement>
    video: VideoHTMLAttributes<HTMLVideoElement>
  }
}
