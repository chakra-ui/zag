export type SplitArgs<T = any> = {
  attributes: T
  handlers: Record<string, EventListener>
}
