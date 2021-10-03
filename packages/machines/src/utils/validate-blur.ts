import { toArray } from "tiny-array"
import { cast } from "tiny-fn"

/**
 * Determine if the blur event within an element is valid
 */
export function validateBlur(event: Event, opts: Options) {
  const exclude = toArray(opts.exclude)
  const relatedTarget = cast<HTMLElement>(event.relatedTarget ?? opts.fallback)
  return exclude.every((el) => !el?.contains(relatedTarget))
}

type MaybeArray<T> = T | T[]

type Options = {
  exclude: MaybeArray<HTMLElement | null>
  fallback?: HTMLElement | null
}

type Event = Pick<FocusEvent, "relatedTarget">
