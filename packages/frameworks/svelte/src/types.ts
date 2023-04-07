export type SplitArgs<T = any> = {
  attrs: T
  handlers: {
    styles: T
    events: Record<string, EventListener>
  }
}
