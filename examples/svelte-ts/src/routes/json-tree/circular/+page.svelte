<script lang="ts">
  import JsonTree from "#lib/components/json-tree.svelte"
  import { jsonTreeCircularData } from "@zag-js/shared"
</script>

<main>
  <JsonTree
    data={jsonTreeCircularData}
    label="Workspace with circular references"
    hint="Circular references show a marker instead of expanding forever."
  />
</main>
