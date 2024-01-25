<script lang="ts">
  import * as avatar from "@zag-js/avatar"
  import { avatarData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/Toolbar.svelte"

  const images = avatarData.full
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

  let src = $state(images[0])
  let showImage = $state(true)

  const machine = useMachine(avatar.machine({ id: "1" }))
  const api = $derived(avatar.connect(machine.state, machine.send, normalizeProps))
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

<Toolbar {machine} />
