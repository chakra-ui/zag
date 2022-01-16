import { injectGlobal } from "@emotion/css"
import * as Dialog from "@ui-machines/dialog"
import { useMachine, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment, ref as vueRef, Teleport } from "vue"
import { dialogStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

injectGlobal(dialogStyle)

export default defineComponent({
  name: "Dialog",
  setup() {
    const inputRef = vueRef<HTMLInputElement | null>(null)

    // Dialog 1
    const [state, send] = useMachine(Dialog.machine)
    const ref = useMount(send)
    const parentDialogRef = computed(() => Dialog.connect<VuePropTypes>(state.value, send))

    // Dialog 2
    const [state2, send2] = useMachine(Dialog.machine)
    const ref2 = useMount(send2)
    const childDialogRef = computed(() => Dialog.connect<VuePropTypes>(state2.value, send2))

    return () => {
      const parentDialog = parentDialogRef.value
      const childDialog = childDialogRef.value

      return (
        <>
          <div ref={ref2}>
            <div class="root">
              <button ref={ref} class="dialog__button" {...parentDialog.triggerProps} data-testid="trigger-1">
                Open Dialog
              </button>
              <div style={{ minHeight: "1200px" }} />
              {parentDialog.isOpen && (
                <>
                  <Teleport to="body">
                    <div class="dialog__overlay" {...parentDialog.overlayProps} data-testid="overlay-1" />
                    <div class="dialog__content" {...parentDialog.contentProps}>
                      <h2 class="dialog__title" {...parentDialog.titleProps}>
                        Edit profile
                      </h2>
                      <p {...parentDialog.descriptionProps}>
                        Make changes to your profile here. Click save when you are done.
                      </p>
                      <button class="dialog__close-button" {...parentDialog.closeButtonProps} data-testid="close-1">
                        X
                      </button>
                      <input type="text" ref={inputRef} placeholder="Enter name..." data-testid="input-1" />
                      <button data-testid="save-button-1">Save Changes</button>

                      <button class="dialog__button" {...childDialog.triggerProps} data-testid="trigger-2">
                        Open Nested
                      </button>

                      {childDialog.isOpen && (
                        <>
                          <Teleport to="body">
                            <div class="dialog__overlay" {...childDialog.overlayProps} data-testid="overlay-2" />
                            <div class="dialog__content" {...childDialog.contentProps}>
                              <h2 class="dialog__title" {...childDialog.titleProps}>
                                Nested
                              </h2>
                              <button
                                class="dialog__close-button"
                                {...childDialog.closeButtonProps}
                                data-testid="close-2"
                              >
                                X
                              </button>
                              <button onClick={() => parentDialog.close()} data-testid="special-close">
                                Close Dialog 1
                              </button>
                            </div>
                          </Teleport>
                        </>
                      )}
                    </div>
                  </Teleport>
                </>
              )}
              <StateVisualizer state={state} />
            </div>
          </div>
        </>
      )
    }
  },
})
