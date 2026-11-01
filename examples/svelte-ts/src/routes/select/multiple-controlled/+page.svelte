<script lang="ts">
  import SelectControlledOpen from "#lib/components/select-controlled-open.svelte"
  import "@styles/select.css"
</script>

<main class="select">
  <div style="display: flex; gap: 4px">
    <SelectControlledOpen id="a" />
    <SelectControlledOpen id="b" />
  </div>
</main>
