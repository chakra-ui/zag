type OptionSet = { default: unknown; options: unknown[] }

const isOptionSet = (value: unknown): value is OptionSet =>
  typeof value === "object" && value !== null && "options" in value

export function defaultOf(value: unknown) {
  return isOptionSet(value) ? value.default : value
}

export function getChangedProps(
  defaults: Record<string, unknown>,
  values: Record<string, unknown>,
): string[] {
  return Object.keys(defaults).filter(
    (key) => values[key] !== defaultOf(defaults[key]),
  )
}
