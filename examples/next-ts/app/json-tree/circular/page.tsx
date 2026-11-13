"use client"

import { JsonTree } from "@/components/json-tree"
import { jsonTreeCircularData } from "@zag-js/shared"

export default function Page() {
  return (
    <main>
      <JsonTree
        data={jsonTreeCircularData}
        label="Workspace with circular references"
        hint="Circular references show a marker instead of expanding forever."
      />
    </main>
  )
}
