import type { JSX, MaybeFn, Nullable } from "@zag-js/types"

interface VirtualElement {
  getBoundingClientRect(): DOMRect
  contextElement?: Element | undefined
}

export type MeasurableElement = Element | VirtualElement

export type Booleanish = boolean | "true" | "false"

export interface Point {
  x: number
  y: number
}

export interface EventKeyOptions {
  dir?: "ltr" | "rtl" | undefined
  orientation?: "horizontal" | "vertical" | undefined
}

export type NativeEvent<E> =
  JSX.ChangeEvent<any> extends E ? InputEvent : E extends JSX.SyntheticEvent<any, infer T> ? T : never

export type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent

export type MaybeElement = Nullable<HTMLElement>

export type MaybeElementOrFn = MaybeFn<MaybeElement>
