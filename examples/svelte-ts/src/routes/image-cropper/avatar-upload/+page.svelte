<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as imageCropper from "@zag-js/image-cropper"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/image-cropper.css"

  let src = $state("")
  let zoom = $state(1)
  let avatar = $state("")

  const id = $props.id()
  const service = useMachine(imageCropper.machine, (): imageCropper.Props => ({
    id,
    cropShape: "circle",
    aspectRatio: 1,
    zoom,
    onZoomChange: (details) => (zoom = details.zoom),
  }))
  const api = $derived(imageCropper.connect(service, normalizeProps))

  $effect(() => {
    const current = src
    if (!current) return
    return () => URL.revokeObjectURL(current)
  })

  function onchange(event: Event & { currentTarget: HTMLInputElement }) {
    const { files } = event.currentTarget
    if (!files || files.length === 0) return
    src = URL.createObjectURL(files[0])
  }

  async function save() {
    const url = await api.getCroppedImage({ output: "dataUrl", type: "image/png" })
    if (typeof url === "string") avatar = url
  }

  function startOver() {
    src = ""
    avatar = ""
    zoom = 1
  }
</script>

<main>
  <div class="image-cropper-avatar-upload">
    {#if !src}
      <label class="picker">
        <span>Choose a photo</span>
        <input type="file" accept="image/*" {onchange} />
      </label>
    {:else}
      <div {...api.getRootProps()}>
        <div {...api.getViewportProps()}>
          <img {src} alt="Selected for your avatar" {...api.getImageProps()} />
          <div {...api.getSelectionProps()}></div>
        </div>
      </div>
      <label class="zoom">
        <span>Zoom</span>
        <input
          type="range"
          aria-label="Zoom"
          min={service.prop("minZoom")}
          max={service.prop("maxZoom")}
          step={0.1}
          value={zoom}
          oninput={(event) => api.setZoom(Number(event.currentTarget.value))}
        />
      </label>
      <div class="actions">
        <button type="button" onclick={save}>Save avatar</button>
        <button type="button" onclick={startOver}>Choose another photo</button>
      </div>
    {/if}
    {#if avatar}
      <img class="avatar-preview" src={avatar} alt="Your new avatar" />
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["naturalSize", "crop", "zoom"]} />
</Toolbar>
