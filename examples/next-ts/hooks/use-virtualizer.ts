import {
  GridVirtualizer,
  ListVirtualizer,
  type GridVirtualizerOptions,
  type ListVirtualizerOptions,
} from "@zag-js/virtualizer"
import { useCallback, useEffect, useReducer, useState } from "react"
import { flushSync } from "react-dom"

export function useListVirtualizer(options: ListVirtualizerOptions) {
  const [, rerender] = useReducer(() => ({}), {})

  const [virtualizer] = useState(
    () =>
      new ListVirtualizer({
        ...options,
        onRangeChange(...args) {
          flushSync(rerender)
          options.onRangeChange?.(...args)
        },
      }),
  )

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
      rerender()
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  return { virtualizer, ref }
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  const [, rerender] = useReducer(() => ({}), {})

  const [virtualizer] = useState(
    () =>
      new GridVirtualizer({
        ...options,
        onRangeChange(...args) {
          flushSync(rerender)
          options.onRangeChange?.(...args)
        },
      }),
  )

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
      rerender()
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  return { virtualizer, ref }
}
