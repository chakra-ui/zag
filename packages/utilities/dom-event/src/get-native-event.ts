import type { JSX } from "@zag-js/types"

type NativeEvent<E> =
  JSX.ChangeEvent<any> extends E ? InputEvent : E extends JSX.SyntheticEvent<any, infer T> ? T : never

export function getNativeEvent<E>(event: E): NativeEvent<E> {
  return (event as any).nativeEvent ?? event
}
