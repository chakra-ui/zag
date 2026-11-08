<script lang="ts">
  import JsonTree from "#lib/components/json-tree.svelte"
  import { jsonTreeLargeData } from "@zag-js/shared"

  const options = { groupArraysAfterLength: 100, collapseStringsAfterLength: 40, maxPreviewItems: 4 }
</script>

<main>
  <JsonTree
    data={jsonTreeLargeData}
    label="Audit log export"
    hint="The 500 events are grouped into ranges of 100. Expand a range to see its events."
    {options}
  />
</main>
