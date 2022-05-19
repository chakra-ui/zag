export function isKeyboardClick(e: { detail: number; clientX: number; clientY: number }) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
}

export function getNativeEvent<E>(
  event: E,
): React.ChangeEvent<any> extends E ? InputEvent : E extends React.SyntheticEvent<any, infer T> ? T : never {
  return (event as any).nativeEvent ?? event
}
