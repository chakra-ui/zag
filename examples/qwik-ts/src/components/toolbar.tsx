import { component$, Slot, useSignal } from "@builder.io/qwik"
import { dataAttr } from "@zag-js/dom-query"

type ToolbarProps = {
  controls?: any
  viz?: boolean
}

export default component$<ToolbarProps>((props) => {
  const active = useSignal(props.viz ? 1 : !props.controls ? 1 : 0)

  return (
    <div class="toolbar">
      <nav>
        {props.controls && (
          <button data-active={dataAttr(active.value === 0)} onClick$={() => (active.value = 0)}>
            Controls
          </button>
        )}
        <button data-active={dataAttr(active.value === 1)} onClick$={() => (active.value = 1)}>
          Visualizer
        </button>
      </nav>
      <div>
        {props.controls && (
          <div data-content data-active={dataAttr(active.value === 0)}>
            {/* <props.controls /> */}
          </div>
        )}
        <div data-content data-active={dataAttr(active.value === 1)}>
          <Slot />
        </div>
      </div>
    </div>
  )
})
