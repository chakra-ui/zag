interface VirtualElement {
  getBoundingClientRect(): DOMRect
  contextElement?: Element | undefined
}

export type MeasurableElement = Element | VirtualElement

export type Booleanish = boolean | "true" | "false"
