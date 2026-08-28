<script lang="ts">
  import FloatingPanelStackItem from "$lib/components/floating-panel-stack-item.svelte"
</script>

<main class="floating-panel">
  <div style="display: flex; gap: 12px;">
    <FloatingPanelStackItem name="A" offset={0} />
    <FloatingPanelStackItem name="B" offset={40} />
  </div>
</main>
