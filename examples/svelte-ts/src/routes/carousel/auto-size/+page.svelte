<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as carousel from "@zag-js/carousel"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/carousel.css"

  // Variable width content (content-driven sizing)
  const variableWidthData = [
    { content: "Short", color: "#ff6b6b", type: "text" },
    {
      content: "This is a much longer slide with significantly more content that will naturally take up more space",
      color: "#4ecdc4",
      type: "text",
    },
    { content: "Hi", color: "#45b7d1", type: "text" },
    { content: "Medium length slide content here", color: "#96ceb4", type: "text" },
    { content: "⭐ Star Rating Widget ⭐⭐⭐⭐⭐", color: "#ffeaa7", type: "widget" },
    { content: "X", color: "#dda0dd", type: "text" },
    { content: "🔥 Popular Item with Badge 🔥", color: "#98d8c8", type: "badge" },
    { content: "A", color: "#e74c3c", type: "text" },
    { content: "📊 Analytics Dashboard Component 📈📉", color: "#9b59b6", type: "component" },
  ]

  const id = $props.id()

  const service = useMachine(carousel.machine, {
    id,
    autoSize: true,
    spacing: "16px",
    count: variableWidthData.length,
    allowMouseDrag: true,
    snapType: "mandatory",
  })
  const api = $derived(carousel.connect(service, normalizeProps))

  const fixedService = useMachine(carousel.machine, {
    id: `${id}-fixed`,
    autoSize: false,
    spacing: "16px",
    slidesPerPage: 2,
    count: variableWidthData.length,
    allowMouseDrag: true,
  })
  const fixedApi = $derived(carousel.connect(fixedService, normalizeProps))

  const slideStyle = (color: string) =>
    `min-height: 120px; background-color: ${color}; border-radius: 8px; color: white; font-weight: bold; text-align: center; padding: 16px; box-sizing: border-box;`

  const indicatorStyle = (active: boolean) =>
    `width: 12px; height: 12px; border-radius: 50%; border: none; background-color: ${active ? "#333" : "#ccc"}; margin: 0 4px; cursor: pointer;`
</script>

<main class="carousel-auto-size">
  <div {...api.getRootProps()}>
    <h2>Auto Size Carousel</h2>
    <p>Each slide has a different size based on its content.</p>

    <div {...api.getControlProps()}>
      <button {...api.getAutoplayTriggerProps()}>{api.isPlaying ? "Stop" : "Play"}</button>
      <div class="carousel-spacer"></div>
      <button {...api.getPrevTriggerProps()}>← Prev</button>
      <button {...api.getNextTriggerProps()}>Next →</button>
    </div>

    <div {...api.getItemGroupProps()}>
      {#each variableWidthData as slide, index}
        <div {...mergeProps(api.getItemProps({ index, snapAlign: "center" }), { style: slideStyle(slide.color) })}>
          {slide.content}
        </div>
      {/each}
    </div>

    <div {...api.getIndicatorGroupProps()}>
      {#each variableWidthData as _, index}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button {...mergeProps(api.getIndicatorProps({ index }), { style: indicatorStyle(index === api.page) })}
        ></button>
      {/each}
    </div>

    <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>
  </div>

  <div style="margin-top: 32px">
    <h3>Comparison: Fixed Width Carousel</h3>
    <div {...fixedApi.getRootProps()}>
      <div {...fixedApi.getControlProps()}>
        <button {...fixedApi.getPrevTriggerProps()}>← Prev</button>
        <div class="carousel-spacer"></div>
        <button {...fixedApi.getNextTriggerProps()}>Next →</button>
      </div>

      <div {...fixedApi.getItemGroupProps()}>
        {#each variableWidthData as slide, index}
          <div
            {...mergeProps(fixedApi.getItemProps({ index }), {
              style: `${slideStyle(slide.color)} display: flex; align-items: center; justify-content: center;`,
            })}
          >
            {slide.content}
          </div>
        {/each}
      </div>

      <div {...fixedApi.getIndicatorGroupProps()}>
        {#each fixedApi.pageSnapPoints as _, index}
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button
            {...mergeProps(fixedApi.getIndicatorProps({ index }), { style: indicatorStyle(index === fixedApi.page) })}
          ></button>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} omit={["translations"]} />
</Toolbar>

<style>
  .carousel-auto-size {
    padding: 32px;
    max-width: 800px;
    margin: 0 auto;
  }

  .carousel-spacer {
    flex: 1;
  }

  h2 {
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 24px;
    color: #666;
  }
</style>
