import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Dialog",
  setup() {
    const [state, send] = useMachine(dialog.machine({ id: "dialog", defaultOpen: true }))

    const parentDialogRef = computed(() => dialog.connect(state.value, send, normalizeProps))

    return () => {
      const parentDialog = parentDialogRef.value

      return (
        <>
          <main>
            <div>
              <button {...parentDialog.triggerProps} data-testid="trigger-1">
                Open Dialog
              </button>
              <div style={{ minHeight: "1200px", pointerEvents: "none" }} />
              {parentDialog.isOpen && (
                <Teleport to="body">
                  <div class="dialog-backdrop" {...parentDialog.backdropProps} />
                  <div {...parentDialog.underlayProps} data-testid="underlay-1">
                    <div {...parentDialog.contentProps}>
                      <h2 {...parentDialog.titleProps}>Edit profile</h2>
                      <p {...parentDialog.descriptionProps}>
                        Make changes to your profile here. Click save when you are done.
                      </p>
                      <button {...parentDialog.closeButtonProps} data-testid="close-1">
                        X
                      </button>
                      <input type="text" placeholder="Enter name..." data-testid="input-1" />
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
