<script lang="ts">
  import styles from "../../../../../../shared/src/css/avatar.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as avatar from "@zag-js/avatar"
  import { avatarData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const images = avatarData.full
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

  let src = $state(images[0])
  let showImage = $state(true)

  const id = $props.id()
  const service = useMachine(avatar.machine, { id })
  const api = $derived(avatar.connect(service, normalizeProps))
</script>

<main class="avatar">
  <div {...api.getRootProps()} class={styles.Root}>
    <span {...api.getFallbackProps()} class={styles.Fallback}>PA</span>
    {#if showImage}
      <img alt="" referrerpolicy="no-referrer" {src} {...api.getImageProps()} class={styles.Image} />
    {/if}
  </div>

  <div class="controls">
    <button onclick={() => (src = getRandomImage())}>Change Image</button>
    <button onclick={() => (src = avatarData.broken)}>Broken Image</button>
    <button onclick={() => (showImage = !showImage)}>Toggle Image</button>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
