import { isObject } from "@zag-js/utils"
import type { Option } from "./select.types"

export function isOptionData(v: any): v is Option {
  return isObject(v) && "value" in v && "label" in v
}

export function validateOptionData(v: any): asserts v is Option {
  if (!isOptionData(v)) {
    throw new TypeError("Expected an option data object")
  }
}

export function highlightMessage(label: string): string {
  return `${label} selected`
}

export function openMessage(count: number): string {
  return `${count} result${
    count === 1 ? " is" : "s are"
  } available, use up and down arrow keys to navigate. Press Enter or Space Bar keys to select.`
}
