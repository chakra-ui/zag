<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"
  import "@styles/clipboard.css"

  const snippets = [
    { id: "install", title: "Install", code: "pnpm add @zag-js/clipboard" },
    {
      id: "import",
      title: "Import",
      code: 'import * as clipboard from "@zag-js/clipboard"',
    },
    {
      id: "usage",
      title: "Usage",
      code: "const service = useMachine(clipboard.machine, { id: useId() })\nconst api = clipboard.connect(service, normalizeProps)",
    },
  ]

  let activeId = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(clipboard.machine, {
    id,
    timeout: 1000,
  })

  const api = $derived(clipboard.connect(service, normalizeProps))
</script>

<main>
  <div class="code-blocks">
    <div {...api.getRootProps()}>
      {#each snippets as snippet (snippet.id)}
        {@const copied = api.copied && activeId === snippet.id}
        <div class="block">
          <div class="block-header">
            <strong>{snippet.title}</strong>
            <button
              type="button"
              data-copied={copied ? "" : undefined}
              aria-label="{copied ? 'Copied!' : 'Copy'} {snippet.title} snippet"
              onclick={() => {
                activeId = snippet.id
                api.setValue(snippet.code)
                api.copy()
              }}
            >
              {#if copied}
                <ClipboardCheckIcon />
              {:else}
                <ClipboardCopyIcon />
              {/if}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre>{snippet.code}</pre>
        </div>
      {/each}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
