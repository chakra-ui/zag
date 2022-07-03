import { injectGlobal } from "@emotion/css"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, useSetup } from "@zag-js/vue"
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

    // Dialog 1
    const [state, send] = useMachine(dialog.machine)
    const ref = useSetup({ send, id: useId() })
    const parentDialogRef = computed(() => dialog.connect(state.value, send, normalizeProps))

    // Dialog 2
    const [state2, send2] = useMachine(dialog.machine)
    const ref2 = useSetup({ send: send2, id: useId() })
    const childDialogRef = computed(() => dialog.connect(state2.value, send2, normalizeProps))

    return () => {
      const parentDialog = parentDialogRef.value
      const childDialog = childDialogRef.value

      return (
        <>
          <main>
            <div ref={ref2}>
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
                        <button {...childDialog.triggerProps} data-testid="trigger-2">
                          Open Nested
                        </button>
                        {childDialog.isOpen && (
                          <Teleport to="body">
                            <div {...childDialog.underlayProps} data-testid="underlay-2" />
                            <div {...childDialog.contentProps}>
                              <h2 {...childDialog.titleProps}>Nested</h2>
                              <button {...childDialog.closeButtonProps} data-testid="close-2">
                                X
                              </button>
                              <button onClick={() => parentDialog.close()} data-testid="special-close">
                                Close Dialog 1
                              </button>
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
          <Toolbar
            controls={null}
            count={2}
            visualizer={
              <>
                <StateVisualizer state={state} />
                <StateVisualizer state={state2} />
              </>
            }
          />
        </>
      )
    }
  },
})
