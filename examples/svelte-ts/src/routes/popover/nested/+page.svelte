<script lang="ts">
  import Popover from "#lib/components/popover-nested.svelte"
  import "@styles/popover.css"
</script>

<main class="popover">
  <Popover id="p1">
    <Popover nested id="p2">
      <Popover nested id="p3" />
    </Popover>
  </Popover>
</main>
