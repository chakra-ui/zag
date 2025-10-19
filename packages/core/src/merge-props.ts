import { callAll, isString } from "@zag-js/utils"

export interface Props {
  [key: string | symbol]: any
}

const clsx = (...args: (string | undefined)[]) =>
  args
    .map((str) => str?.trim?.())
    .filter(Boolean)
    .join(" ")

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g

const serialize = (style: string): Record<string, string> => {
  const res: Record<string, string> = {}
  let match: RegExpExecArray | null
  while ((match = CSS_REGEX.exec(style))) {
    res[match[1]!] = match[2]!
  }
  return res
}

const css = (
  a: Record<string, string> | string | undefined,
  b: Record<string, string> | string | undefined,
): Record<string, string> | string => {
  if (isString(a)) {
    if (isString(b)) return `${a};${b}`
    a = serialize(a)
  } else if (isString(b)) {
    b = serialize(b)
  }
  return Object.assign({}, a ?? {}, b ?? {})
}

type TupleTypes<T extends any[]> = T[number]

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

type ClassMergeFn = (existing: any, incoming: any) => any
type StyleMergeFn = (existing: any, incoming: any) => any

interface MergeOptions {
  classMerge?: ClassMergeFn
  styleMerge?: StyleMergeFn
}

export function createMergeProps(options: MergeOptions = {}) {
  const { classMerge = clsx, styleMerge = css } = options

  return function mergeProps<T extends Props>(...args: Array<T | undefined>): UnionToIntersection<TupleTypes<T[]>> {
    let result: Props = {}

    for (let props of args) {
      if (!props) continue

      // Handle string keys
      for (let key in result) {
        if (key.startsWith("on") && typeof result[key] === "function" && typeof props[key] === "function") {
          result[key] = callAll(props[key], result[key])
          continue
        }

        if (key === "className" || key === "class") {
          result[key] = classMerge(result[key], props[key])
          continue
        }

        if (key === "style") {
          result[key] = styleMerge(result[key], props[key])
          continue
        }

        result[key] = props[key] !== undefined ? props[key] : result[key]
      }

      // Add props from b that are not in a
      for (let key in props) {
        if (result[key] === undefined) {
          result[key] = props[key]
        }
      }

      // Handle symbol keys (for Svelte attachments)
      const symbols = Object.getOwnPropertySymbols(props)
      for (let symbol of symbols) {
        result[symbol] = props[symbol]
      }
    }

    return result as any
  }
}

export const mergeProps = createMergeProps()
