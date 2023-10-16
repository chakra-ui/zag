import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Dialog",
  setup() {
    // Dialog 1
    const [state, send] = useMachine(dialog.machine({ id: "1" }))

    const parentDialogRef = computed(() => dialog.connect(state.value, send, normalizeProps))

    // Dialog 2
    const [state2, send2] = useMachine(dialog.machine({ id: "2" }))

    const childDialogRef = computed(() => dialog.connect(state2.value, send2, normalizeProps))

    return () => {
      const parentDialog = parentDialogRef.value
      const childDialog = childDialogRef.value

      return (
        <>
          <main>
            <div>
              <div>
                <button {...parentDialog.triggerProps} data-testid="trigger-1">
                  Open Dialog
                </button>
                <div style={{ minHeight: "1200px", pointerEvents: "none" }} />
                {parentDialog.isOpen && (
                  <Teleport to="body">
                    <div {...parentDialog.backdropProps} />
                    <div {...parentDialog.positionerProps} data-testid="positioner-1">
                      <div {...parentDialog.contentProps}>
                        <h2 {...parentDialog.titleProps}>Edit profile</h2>
                        <p {...parentDialog.descriptionProps}>
                          Make changes to your profile here. Click save when you are done.
                        </p>
                        <button {...parentDialog.closeTriggerProps} data-testid="close-1">
                          X
                        </button>
                        <input type="text" placeholder="Enter name..." data-testid="input-1" />
                        <button data-testid="save-button-1">Save Changes</button>
                        <button {...childDialog.triggerProps} data-testid="trigger-2">
                          Open Nested
                        </button>
                        {childDialog.isOpen && (
                          <Teleport to="body">
                            <div {...childDialog.positionerProps} data-testid="positioner-2">
                              <div {...childDialog.contentProps}>
                                <h2 {...childDialog.titleProps}>Nested</h2>
                                <button {...childDialog.closeTriggerProps} data-testid="close-2">
                                  X
                                </button>
                                <button onClick={() => parentDialog.close()} data-testid="special-close">
                                  Close Dialog 1
                                </button>
                              </div>
                            </div>
                          </Teleport>
                        )}
                      </div>
                    </div>
                  </Teleport>
                )}
              </div>
            </div>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
            <StateVisualizer state={state2} />
          </Toolbar>
        </>
      )
    }
  },
})
