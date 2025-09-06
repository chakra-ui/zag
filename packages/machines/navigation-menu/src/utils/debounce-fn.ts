import { noop } from "@zag-js/utils"

type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then: (onfulfilled: infer F, ...args: infer _) => any }
    ? F extends (value: infer V, ...args: infer _) => any
      ? Awaited<V>
      : never
    : T
type Promisify<T> = Promise<Awaited<T>>
type PromisifyFn<T extends AnyFn> = (...args: ArgumentsType<T>) => Promisify<ReturnType<T>>
type AnyFn = (...args: any[]) => any
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never
type FunctionArgs<Args extends any[] = any[], Return = void> = (...args: Args) => Return
type ValueOrGetter<T> = T | (() => T)
type TimerHandle = ReturnType<typeof setTimeout> | undefined

interface FunctionWrapperOptions<Args extends any[] = any[], This = any> {
  fn: FunctionArgs<Args, This>
  args: Args
  thisArg: This
}

type EventFilter<Args extends any[] = any[], This = any, Invoke extends AnyFn = AnyFn> = (
  invoke: Invoke,
  options: FunctionWrapperOptions<Args, This>,
) => ReturnType<Invoke> | Promisify<ReturnType<Invoke>>

export interface DebounceFilterOptions {
  /**
   * The maximum time allowed to be delayed before it's invoked.
   * In milliseconds.
   */
  maxWait?: ValueOrGetter<number>

  /**
   * Whether to reject the last call if it's been cancel.
   *
   * @default false
   */
  rejectOnCancel?: boolean
}

function createFilterWrapper<T extends AnyFn>(filter: EventFilter, fn: T) {
  function wrapper(this: any, ...args: ArgumentsType<T>) {
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args }))
        .then(resolve)
        .catch(reject)
    })
  }

  return wrapper
}

function debounceFilter(ms: ValueOrGetter<number>, options: DebounceFilterOptions = {}) {
  let timer: TimerHandle
  let maxTimer: TimerHandle
  let lastRejector: AnyFn = noop

  const _clearTimeout = (timer: TimerHandle) => {
    clearTimeout(timer)
    lastRejector()
    lastRejector = noop
  }

  let lastInvoker: () => void

  const filter: EventFilter = (invoke) => {
    const duration = typeof ms === "function" ? ms() : ms
    const maxDuration = typeof options.maxWait === "function" ? options.maxWait() : options.maxWait

    if (timer) _clearTimeout(timer)

    if (duration <= 0 || (maxDuration !== undefined && maxDuration <= 0)) {
      if (maxTimer) {
        _clearTimeout(maxTimer)
        maxTimer = undefined
      }
      return Promise.resolve(invoke())
    }

    return new Promise((resolve, reject) => {
      lastRejector = options.rejectOnCancel ? reject : resolve
      lastInvoker = invoke
      if (maxDuration && !maxTimer) {
        maxTimer = setTimeout(() => {
          if (timer) _clearTimeout(timer)
          maxTimer = undefined
          resolve(lastInvoker())
        }, maxDuration)
      }

      timer = setTimeout(() => {
        if (maxTimer) _clearTimeout(maxTimer)
        maxTimer = undefined
        resolve(invoke())
      }, duration)
    })
  }

  return filter
}

export type DebounceFnReturn<T extends FunctionArgs> = PromisifyFn<T>

export function debounceFn<T extends FunctionArgs>(
  fn: T,
  ms: ValueOrGetter<number>,
  options: DebounceFilterOptions = {},
): DebounceFnReturn<T> {
  return createFilterWrapper(debounceFilter(ms, options), fn)
}
