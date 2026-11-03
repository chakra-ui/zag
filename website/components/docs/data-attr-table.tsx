import { type DataAttrDocKey, getDataAttrDoc } from "@zag-js/docs"
import { GroupedDocTable } from "components/ui/doc-table"

export function DataAttrTable(props: { name: DataAttrDocKey }) {
  try {
    return <GroupedDocTable data={getDataAttrDoc(props.name)} />
  } catch {
    return null
  }
}
