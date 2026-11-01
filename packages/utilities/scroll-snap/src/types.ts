export type ScrollAxis = "x" | "y"

export type ScrollDirection = "left" | "right" | "up" | "down"

export type ScrollSnapAlignment = "start" | "end" | "center" | "none"

export type Direction = "ltr" | "rtl"

export type SnapPositionList = Record<Exclude<ScrollSnapAlignment, "none">, Array<{ node: Element; position: number }>>
