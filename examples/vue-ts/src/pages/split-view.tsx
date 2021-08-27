import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { splitView } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"

const styles = css`
  .root {
    height: 300px;
  }

  .pane {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid lightgray;
    overflow: auto;
  }

  .splitter {
    width: 8px;
    background: #ebebeb;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease-in-out;
    outline: 0;
  }

  .splitter[data-focus] {
    background: #b0baf1;
  }

  .splitter:active {
    background: #3f51b5;
    color: white;
  }

  .splitter-bar {
    width: 2px;
    height: 40px;
    background-color: currentColor;
  }
`

export default defineComponent({
  name: "Split View",
  setup() {
    const [state, send] = useMachine(splitView.machine.withContext({ min: 0 }))

    const _ref = useMount(send)
    const mp = computed(() => splitView.connect(state.value, send, normalizeProps))

    return () => (
      <div className={styles}>
        <div className="root">
          <div ref={_ref} {...mp.value.rootProps}>
            <div className="pane" {...mp.value.primaryPaneProps}>
              <div>
                <small {...mp.value.labelProps}>Table of Contents</small>
                <p>Primary Pane</p>
              </div>
            </div>
            <div className="splitter" {...mp.value.splitterProps}>
              <div className="splitter-bar" />
            </div>
            <div className="pane" {...mp.value.secondaryPaneProps}>
              Secondary Pane
            </div>
          </div>
        </div>
        <StateVisualizer state={state.value} />
      </div>
    )
  },
})
