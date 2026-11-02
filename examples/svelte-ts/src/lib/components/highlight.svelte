<script lang="ts">
  import { getFuzzyMatchRanges } from "@zag-js/fuzzy"
  import { highlightRanges } from "@zag-js/highlight-word"

  interface Props {
    text: string
    query: string
  }

  const props: Props = $props()

  const chunks = $derived(highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) }))
</script>

<span>
  {#each chunks as chunk, index (index)}
    {#if chunk.match}<mark>{chunk.text}</mark>{:else}{chunk.text}{/if}
  {/each}
</span>
