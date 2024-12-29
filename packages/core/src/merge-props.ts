import { callAll, isString } from "@zag-js/utils"

interface Props {
  [key: string]: any
}

type ClassValue = ClassValue[] | Record<string, any> | string | number | bigint | null | boolean | undefined

const classValueToString = (mix: ClassValue) => {
  let i: any
  let j: any

  let str = ""

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      const len = mix.length

      for (i = 0; i < len; i++) {
        if (mix[i]) {
          if ((j = classValueToString(mix[i]))) {
            str && (str += " ")
            str += j
          }
        }
      }
    } else {
      for (j in mix) {
        if (mix![j]) {
          str && (str += " ")
          str += j
        }
      }
    }
  }

  return str
}

const clsx = (...args: ClassValue[]) => {
  let idx = 0
  let tmp: ClassValue
  let cls: string
  let str = ""
  let len = args.length

  for (; idx < len; idx++) {
    if ((tmp = args[idx])) {
      if ((cls = classValueToString(tmp))) {
        str && (str += " ")
        str += cls
      }
    }
  }

  return str
}

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

export function mergeProps<T extends Props>(...args: T[]): UnionToIntersection<TupleTypes<T[]>> {
  let result: Props = {}

  for (let props of args) {
    for (let key in result) {
      if (key.startsWith("on") && typeof result[key] === "function" && typeof props[key] === "function") {
        result[key] = callAll(props[key], result[key])
        continue
      }

      if (key === "className" || key === "class") {
        result[key] = clsx(result[key], props[key])
        continue
      }

      if (key === "style") {
        result[key] = css(result[key], props[key])
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
  }

  return result as any
}
