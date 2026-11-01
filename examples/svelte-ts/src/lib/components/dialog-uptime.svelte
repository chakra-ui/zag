<script lang="ts">
  // A remount resets this to 0, so a steady count proves the dialog was never torn down.
  let ticks = $state(0)

  $effect(() => {
    const id = setInterval(() => (ticks += 1), 100)
    return () => clearInterval(id)
  })
</script>

<p data-testid="uptime">
  content uptime: <b data-testid="ticks">{ticks}</b> ticks
</p>
