import { jsonTreeLargeData } from "@zag-js/shared"
import { JsonTree } from "~/components/json-tree"

const options = { groupArraysAfterLength: 100, collapseStringsAfterLength: 40, maxPreviewItems: 4 }

export default function Page() {
  return (
    <main>
      <JsonTree
        data={jsonTreeLargeData}
        label="Audit log export"
        hint="The 500 events are grouped into ranges of 100. Expand a range to see its events."
        options={options}
      />
    </main>
  )
}
