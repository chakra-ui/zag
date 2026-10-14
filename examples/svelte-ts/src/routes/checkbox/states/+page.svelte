<script lang="ts">
  import Checkbox from "$lib/components/checkbox.svelte"
  import "@styles/checkbox.css"
</script>

<main class="checkbox">
  <div class="vstack gap-4">
    <Checkbox label="Default" />
    <Checkbox label="Checked" defaultChecked />
    <Checkbox label="Indeterminate" defaultChecked="indeterminate" />
    <Checkbox label="Disabled" disabled />
    <Checkbox label="Disabled and checked" disabled defaultChecked />
    <Checkbox label="Read-only" readOnly defaultChecked description="Shows its value but can't be changed." />
    <Checkbox label="Invalid" invalid description="Marks the field as having an error." />
  </div>
</main>
