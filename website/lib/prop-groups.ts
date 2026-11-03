export interface PropMeta {
  type: string
  description: string
  defaultValue?: string | null
}

type Entry = [name: string, meta: PropMeta]

export interface PropGroup {
  label: "State" | "Behavior" | "Events" | "Advanced"
  collapsed: boolean
  props: Entry[]
}

const ADVANCED = new Set(["id", "ids", "dir", "getRootNode"])
const ORDER: PropGroup["label"][] = ["State", "Behavior", "Events", "Advanced"]

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const changeStem = (name: string) => /^on([A-Z]\w*)Change$/.exec(name)?.[1]

export function groupProps(entries: Entry[]): PropGroup[] {
  const names = new Set(entries.map(([name]) => name))
  const controlled = [...names].filter((name) =>
    names.has(`default${cap(name)}`),
  )
  const state = new Set<string>()
  for (const name of controlled) {
    state.add(name).add(`default${cap(name)}`)
    for (const other of names) {
      const stem = changeStem(other)
      if (stem && name.toLowerCase().startsWith(stem.toLowerCase()))
        state.add(other)
    }
  }

  const labelOf = (name: string): PropGroup["label"] => {
    if (state.has(name)) return "State"
    if (ADVANCED.has(name)) return "Advanced"
    if (/^on[A-Z]/.test(name)) return "Events"
    return "Behavior"
  }

  return ORDER.map((label) => ({
    label,
    collapsed: label === "Advanced",
    props: entries.filter(([name]) => labelOf(name) === label),
  })).filter((group) => group.props.length > 0)
}
