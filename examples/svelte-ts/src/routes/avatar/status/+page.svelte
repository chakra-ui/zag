<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as avatar from "@zag-js/avatar"
  import { avatarData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/avatar.css"

  const images = avatarData.full

  let log = $state<string[]>([])
  let index = $state(0)
  let src = $state(images[0])
  let showImage = $state(true)
  let wrapped = $state(false)

  const id = $props.id()
  const service = useMachine(avatar.machine, {
    id,
    onStatusChange({ status }) {
      log = [...log, status]
    },
  })
  const api = $derived(avatar.connect(service, normalizeProps))

  const nextImage = () => {
    index = (index + 1) % images.length
    src = images[index]
  }
</script>

{#snippet image()}
  <img alt="" referrerpolicy="no-referrer" {src} {...api.getImageProps()} />
{/snippet}

<main class="avatar">
  <div {...api.getRootProps()}>
    <span {...api.getFallbackProps()}>PA</span>
    {#if showImage}
      {#if wrapped}
        <picture>{@render image()}</picture>
      {:else}
        {@render image()}
      {/if}
    {/if}
  </div>

  <div class="controls">
    <button onclick={nextImage}>Next image</button>
    <button onclick={() => (src = avatarData.broken)}>Broken image</button>
    <button onclick={() => (showImage = !showImage)}>Toggle image</button>
    <button onclick={() => (wrapped = !wrapped)}>Wrap in picture: {String(wrapped)}</button>
  </div>

  <p>Status: <output aria-label="Load status">{api.status}</output></p>
  <p>onStatusChange: <output aria-label="Status reports">{log.join(",") || "-"}</output></p>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
