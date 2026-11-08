"use client"

import { JsonTree } from "@/components/json-tree"
import { jsonTreeOrderResponse } from "@zag-js/shared"

const options = { maxPreviewItems: 2 }

export default function Page() {
  return (
    <main>
      <JsonTree
        data={jsonTreeOrderResponse}
        label="Order API response"
        hint="Previews show the first two items. Expand the metadata Map or the tags Set to see every entry."
        options={options}
      />
    </main>
  )
}
