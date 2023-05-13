<script lang="ts">
  import { dataAttr } from "@zag-js/dom-query"

  export let controls: boolean = true
  export let viz: boolean = false

  let active = viz ? 1 : controls === null ? 1 : 0
</script>

<div class="toolbar">
  <nav>
    {#if controls !== null}
      <button
        data-active={dataAttr(active === 0)}
        on:click={() => {
          active = 0
        }}
      >
        Controls
      </button>
    {/if}

    <button
      data-active={dataAttr(active === 1)}
      on:click={() => {
        active = 1
      }}
    >
      Visualizer
    </button>
  </nav>
  <div>
    {#if controls !== null}
      <div data-content data-active={dataAttr(active === 0)}>
        <slot name="controls" />
      </div>
    {/if}
    <div data-content data-active={dataAttr(active === 1)}>
      <slot />
    </div>
  </div>
</div>
