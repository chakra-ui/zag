export function Toolbar({ viz = false, controls = true }: { viz?: boolean; controls?: boolean }) {
  return (
    <div class="toolbar" x-data={`{active: ${viz ? 1 : !controls ? 1 : 0}}`}>
      <nav>
        {controls && (
          <button x-bind:data-active="$dataAttr(active === 0)" x-on:click="active = 0">
            Controls
          </button>
        )}
        <button x-bind:data-active="$dataAttr(active === 1)" x-on:click="active = 1">
          Visualizer
        </button>
      </nav>
      <div>
        {controls && (
          <div data-content x-bind:data-active="$dataAttr(active === 0)">
            <slot name="controls" />
          </div>
        )}
        <div data-content x-bind:data-active="$dataAttr(active === 1)">
          <slot />
        </div>
      </div>
    </div>
  )
}
