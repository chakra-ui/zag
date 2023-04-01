export type SplitArgs<T = any> = {
  attrs: T
  rest: {
    styles: T
    handlers: Record<string, EventListener>
  }
}
