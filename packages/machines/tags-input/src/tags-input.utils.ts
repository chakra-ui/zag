import type { ValidateArgs } from "./tags-input.types"

/** The value without its trailing delimiter, or `undefined` if it doesn't end with one */
export function trimTrailingDelimiter(value: string, delimiter: string | RegExp | undefined) {
  if (!delimiter) return
  if (typeof delimiter === "string") {
    return value.endsWith(delimiter) ? value.slice(0, -delimiter.length) : undefined
  }
  const regex = new RegExp(`(?:${delimiter.source})$`, delimiter.flags.replace(/[gy]/g, ""))
  const match = regex.exec(value)
  if (!match?.[0]) return
  return value.slice(0, match.index)
}

interface PastedTagsOptions {
  value: string[]
  max: number
  allowOverflow: boolean | undefined
  allowDuplicates: boolean | undefined
  validate: ((details: ValidateArgs) => boolean) | undefined
}

/** Runs each pasted tag, in order, through the checks a typed tag goes through */
export function getPastedTags(tags: string[], options: PastedTagsOptions) {
  const { max, allowOverflow, allowDuplicates, validate } = options
  const value = Array.from(options.value)
  const added: string[] = []
  const invalid: string[] = []

  for (const tag of tags) {
    if (!tag) continue
    if (!allowOverflow && value.length >= max) break
    if (validate && !validate({ inputValue: tag, value: Array.from(value) })) {
      invalid.push(tag)
      continue
    }
    if (!allowDuplicates && value.includes(tag)) continue
    value.push(tag)
    added.push(tag)
  }

  return { value, added, invalid }
}
