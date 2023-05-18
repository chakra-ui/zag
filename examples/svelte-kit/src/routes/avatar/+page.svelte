<script>
  import * as avatar from "@zag-js/avatar"
  import { events, normalizeProps, useMachine } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"
  import { avatarData } from "@zag-js/shared"

  const images = avatarData.full
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

  $: [state, send] = useMachine(avatar.machine({ id: "s1" }))
  $: api = avatar.connect($state, send, normalizeProps)

  let src = images[0]
  let showImage = true
</script>

<main class="avatar">
  <div {...api.rootProps.attrs}>
    <img alt="" {...api.imageProps.attrs} use:events={api.imageProps.handlers} />
    <span {...api.fallbackProps.attrs}>PA</span>
  </div>

  <div class="controls">
    <button on:click={() => (src = getRandomImage())}>Change Image</button>
    <button on:click={() => (src = avatarData.broken)}>Broken Image</button>
    <button on:click={() => (showImage = !showImage)}>Toggle Image</button>
  </div>
</main>

<Toolbar>
  <StateVisualizer {state} />
</Toolbar>
