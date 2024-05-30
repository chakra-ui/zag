<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as avatar from "@zag-js/avatar"
  import { avatarData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const images = avatarData.full
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

  let src = $state(images[0])
  let showImage = $state(true)

  const [snapshot, send] = useMachine(avatar.machine({ id: "1" }))
  const api = $derived(avatar.connect(snapshot, send, normalizeProps))
</script>

<main class="avatar">
  <div {...api.getRootProps()}>
    <span {...api.getFallbackProps()}>PA</span>
    {#if showImage}
      <img alt="" referrerpolicy="no-referrer" {src} {...api.getImageProps()} />
    {/if}
  </div>

  <div class="controls">
    <button onclick={() => (src = getRandomImage())}>Change Image</button>
    <button onclick={() => (src = avatarData.broken)}>Broken Image</button>
    <button onclick={() => (showImage = !showImage)}>Toggle Image</button>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={snapshot} />
</Toolbar>
