<script lang="ts">
  import { getFuzzyMatchRanges, highlightRanges, highlightWord } from "@zag-js/utils/search"

  interface Props {
    text: string
    query: string
    fuzzy?: boolean
  }

  const props: Props = $props()

  const chunks = $derived(
    props.fuzzy
      ? highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) })
      : highlightWord({ text: props.text, query: props.query, ignoreCase: true, matchAll: true }),
  )
</script>

<span>
  {#each chunks as chunk, index (index)}
    {#if chunk.match}<mark>{chunk.text}</mark>{:else}{chunk.text}{/if}
  {/each}
</span>
