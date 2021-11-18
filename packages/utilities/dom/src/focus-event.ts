/**
 * Determine if the blur event within an element is valid
 */
export function validateBlur(event: Event, opts: Options) {
  const exclude = Array.isArray(opts.exclude) ? opts.exclude : [opts.exclude]
  const relatedTarget = (event.relatedTarget ?? opts.fallback) as HTMLElement
  return exclude.every((el) => !el?.contains(relatedTarget))
}

type MaybeArray<T> = T | T[]

type Options = {
  exclude: MaybeArray<HTMLElement | null>
  fallback?: HTMLElement | null
}

type Event = Pick<FocusEvent, "relatedTarget">
