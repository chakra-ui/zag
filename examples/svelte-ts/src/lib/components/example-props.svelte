<script lang="ts">
  // Shows the machine props an example passes, so the demo explains itself
  interface Props {
    value: Record<string, unknown>
  }

  const { value }: Props = $props()
</script>

<dl class="example-props">
  {#each Object.entries(value) as [key, item] (key)}
    <div>
      <dt>{key}</dt>
      <dd>{typeof item === "function" ? "ƒ" : JSON.stringify(item)}</dd>
    </div>
  {/each}
</dl>
