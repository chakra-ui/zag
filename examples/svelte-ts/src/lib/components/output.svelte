<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements"

  interface Props extends HTMLAttributes<HTMLPreElement> {
    label: string
    value: unknown
  }

  const { label, value, ...rest }: Props = $props()

  // Short values stay on one line
  const text = $derived.by(() => {
    if (typeof value === "string") return value
    const inline = JSON.stringify(value)
    return inline && inline.length <= 48 ? inline : JSON.stringify(value, null, 2)
  })
</script>

<!-- Labeled readout of example state; extra attributes go on the pre -->
<div class="output">
  <span class="output-label">{label}</span>
  <pre {...rest}>{text}</pre>
</div>
