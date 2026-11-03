import apiJson from "@zag-js/docs"
import { groupProps, type PropMeta } from "lib/prop-groups"
import { type PropRow, PropRows } from "./prop-rows"

interface ApiTableProps {
  type: "api" | "context"
  name: keyof typeof apiJson
}

type Entry = [string, PropMeta]

const fullType = (type: string) => type.replace(/ \| undefined$/, "")

// one-line form for the row; the full type shows when the row opens
function shortType(type: string) {
  if (type.includes("=>")) return "function"
  if (type.length <= 32) return type
  const parts = type.split(" | ")
  if (parts.length > 2) return `${parts.slice(0, 2).join(" | ")} | …`
  return `${type.slice(0, 30)}…`
}

/** Server side: picks the rows so the full api json never reaches the client */
export function PropTable(props: ApiTableProps) {
  const { name, type = "api" } = props
  if (!(name in apiJson)) return <p>No data available for {name}</p>

  const entries = Object.entries(apiJson[name][type]) as Entry[]
  const isProps = type === "context"
  const ordered = isProps
    ? groupProps(entries).flatMap((group) => group.props)
    : entries

  const rows: PropRow[] = ordered.map(([key, item]) => {
    const type = fullType(item.type)
    return {
      name: key,
      type,
      shortType: shortType(type),
      description: item.description,
      defaultValue: item.defaultValue ?? undefined,
    }
  })

  return (
    <PropRows
      rows={rows}
      label={isProps ? "Prop" : "Property"}
      showDefault={isProps}
    />
  )
}
