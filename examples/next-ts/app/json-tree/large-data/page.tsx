"use client"

import { JsonTree } from "@/components/json-tree"
import { jsonTreeLargeData } from "@zag-js/shared"

const options = { groupArraysAfterLength: 50, collapseStringsAfterLength: 40, maxPreviewItems: 4 }

export default function Page() {
  return (
    <main>
      <JsonTree
        data={jsonTreeLargeData}
        label="Audit log export"
        hint="The 500 events are grouped into ranges of 50. Expand a range to see its events."
        options={options}
      />
    </main>
  )
}
