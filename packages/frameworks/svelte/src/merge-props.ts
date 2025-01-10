import { mergeProps as zagMergeProps } from "@zag-js/core"
import { toStyleString } from "./normalize-props"

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g

type CSSObject = Record<string, string>

const serialize = (style: string): CSSObject => {
  const res: Record<string, string> = {}
  let match: RegExpExecArray | null
  while ((match = CSS_REGEX.exec(style))) {
    res[match[1]!] = match[2]!
  }
  return res
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

export function mergeProps(...args: Record<string, any>[]) {
  const copy = args.map((arg) => Object.assign({}, arg))
  const classes: ClassValue[] = []

  for (const arg of copy) {
    if ("class" in arg) {
      classes.push(arg.class)
      delete arg.class
    }

    if ("className" in arg) {
      classes.push(arg.className)
      delete arg.className
    }
  }

  const merged = zagMergeProps(...copy)

  if ("style" in merged) {
    if (typeof merged.style === "string") {
      merged.style = serialize(merged.style)
    }
    merged.style = toStyleString(merged.style)
  }

  classes.length && (merged.class = clsx(...classes))
  return merged
}
