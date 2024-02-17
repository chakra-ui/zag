interface VirtualElement {
  getBoundingClientRect(): DOMRect
  contextElement?: Element
}

export type MeasurableElement = Element | VirtualElement

export type Booleanish = boolean | "true" | "false"
