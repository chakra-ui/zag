<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle"
  import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-svelte"
  import "@styles/toggle.css"

  const id = $props.id()

  const bold = useMachine(toggle.machine, { id: `${id}-bold` })
  const italic = useMachine(toggle.machine, { id: `${id}-italic` })
  const underline = useMachine(toggle.machine, { id: `${id}-underline` })

  const boldApi = $derived(toggle.connect(bold, normalizeProps))
  const italicApi = $derived(toggle.connect(italic, normalizeProps))
  const underlineApi = $derived(toggle.connect(underline, normalizeProps))

  const formats = $derived([
    { label: "Bold", Icon: BoldIcon, api: boldApi },
    { label: "Italic", Icon: ItalicIcon, api: italicApi },
    { label: "Underline", Icon: UnderlineIcon, api: underlineApi },
  ])
</script>

<main>
  <div class="toggle-text-formatting">
    <div class="group">
      {#each formats as format (format.label)}
        <button aria-label={format.label} {...format.api.getRootProps()}>
          <span {...format.api.getIndicatorProps()}>
            <format.Icon class="icon" />
          </span>
        </button>
      {/each}
    </div>
    <p
      class="preview"
      data-bold={boldApi.pressed || undefined}
      data-italic={italicApi.pressed || undefined}
      data-underline={underlineApi.pressed || undefined}
    >
      The quick brown fox jumps over the lazy dog.
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={bold} />
</Toolbar>
