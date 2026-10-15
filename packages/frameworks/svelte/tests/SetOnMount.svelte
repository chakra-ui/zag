<script lang="ts">
  let { set }: { set: () => void } = $props()

  $effect(() => {
    set()
  })
</script>
