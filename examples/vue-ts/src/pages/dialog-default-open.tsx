import { injectGlobal } from "@emotion/css"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, ref as vueRef, Teleport } from "vue"
import { dialogStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useId } from "../hooks/use-id"

injectGlobal(dialogStyle)

export default defineComponent({
  name: "Dialog",
  setup() {
    const inputRef = vueRef<HTMLInputElement | null>(null)

    const [state, send] = useMachine(dialog.machine({ defaultOpen: true }))
    const ref = useSetup({ send, id: useId() })
    const parentDialogRef = computed(() => dialog.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const parentDialog = parentDialogRef.value

      return (
        <>
          <main>
            <div ref={ref}>
              <button {...parentDialog.triggerProps} data-testid="trigger-1">
                Open Dialog
              </button>
              <div style={{ minHeight: "1200px", pointerEvents: "none" }} />
              {parentDialog.isOpen && (
                <Teleport to="body">
                  <div {...parentDialog.backdropProps} />
                  <div {...parentDialog.underlayProps} data-testid="underlay-1">
                    <div {...parentDialog.contentProps}>
                      <h2 {...parentDialog.titleProps}>Edit profile</h2>
                      <p {...parentDialog.descriptionProps}>
                        Make changes to your profile here. Click save when you are done.
                      </p>
                      <button {...parentDialog.closeButtonProps} data-testid="close-1">
                        X
                      </button>
                      <input type="text" ref={inputRef} placeholder="Enter name..." data-testid="input-1" />
                      <button data-testid="save-button-1">Save Changes</button>
                    </div>
                  </div>
                </Teleport>
              )}
            </div>
          </main>
          <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
