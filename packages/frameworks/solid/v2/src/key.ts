import { isFunction } from "@zag-js/utils"
import { createComponent, For, type Accessor, type Element } from "solid-js"

export interface KeyProps<T> {
  each?: readonly T[] | null | false | undefined
  by: ((v: T) => any) | keyof T
  fallback?: Element | undefined
  children: (v: Accessor<T>, i: Accessor<number>) => Element
}

/**
 * Renders a list whose items are identified by `by`, same API as `Key` from `@solid-primitives/keyed`.
 * Built on Solid 2's `<For keyed>`.
 */
export function Key<T>(props: KeyProps<T>): Element {
  const key = (item: T) => {
    const by = props.by
    return isFunction(by) ? by(item) : item[by]
  }
  return createComponent(For, {
    get each() {
      return props.each
    },
    keyed: key,
    get fallback() {
      return props.fallback
    },
    get children() {
      return props.children
    },
  })
}
