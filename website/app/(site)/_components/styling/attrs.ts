import type { InspectorRow } from "components/ui/inspector"

export function attrRows(
  attrs: object,
  names: string[],
  active?: string,
): InspectorRow[] {
  const record = attrs as Record<string, unknown>
  return names.map((name) => {
    const value = record[name]
    return {
      name,
      on: value != null && value !== false,
      value: typeof value === "string" && value !== "" ? value : undefined,
      active: name === active,
    }
  })
}
