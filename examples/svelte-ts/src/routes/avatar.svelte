<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as avatar from "@zag-js/avatar"
  import { avatarData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const images = avatarData.full
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

  let src = $state(images[0])
  let showImage = $state(true)

  const [_state, send] = useMachine(avatar.machine({ id: "1" }))
  const api = $derived(avatar.connect(_state, send, normalizeProps))
</script>

<main class="avatar">
  <div {...api.rootProps}>
    <span {...api.fallbackProps}>PA</span>
    {#if showImage}
      <img alt="" referrerpolicy="no-referrer" {src} {...api.imageProps} />
    {/if}
  </div>

  <div class="controls">
    <button onclick={() => (src = getRandomImage())}>Change Image</button>
    <button onclick={() => (src = avatarData.broken)}>Broken Image</button>
    <button onclick={() => (showImage = !showImage)}>Toggle Image</button>
  </div>
</main>

<Toolbar state={_state} />
