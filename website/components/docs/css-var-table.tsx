import { type CssVarDocKey, getCssVarDoc } from "@zag-js/docs"
import { GroupedDocTable } from "components/ui/doc-table"

export function CssVarTable(props: { name: CssVarDocKey }) {
  try {
    return <GroupedDocTable data={getCssVarDoc(props.name)} />
  } catch {
    return null
  }
}
