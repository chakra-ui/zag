export type SplitArgs<T = any> = {
  attributes: T
  styles: T
  handlers: Record<string, EventListener>
}
