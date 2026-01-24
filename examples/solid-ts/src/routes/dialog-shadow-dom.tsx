import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId, createSignal } from "solid-js"
import { Portal } from "solid-js/web"
import styles from "@zag-js/shared/src/style.css?inline"

export default function Page() {
  let mountRef!: HTMLElement
  const [shadowRef, setShadowRef] = createSignal<HTMLDivElement | null>(null)

  const getRootNode = () => shadowRef()?.shadowRoot!

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    getRootNode,
  })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main ref={mountRef}>
      <div style={{ padding: "20px" }}>
        <h1>Dialog with Shadow DOM Test</h1>
        <p>
          <strong>Test Instructions:</strong>
        </p>
        <ol style={{ "margin-bottom": "20px", "line-height": "1.6" }}>
          <li>Open the dialog</li>
          <li>
            Press <kbd>Tab</kbd> to navigate through all elements
          </li>
          <li>
            <strong style={{ color: "green" }}>✓ PASS:</strong> Focus moves into shadow DOM elements (styled with
            colored borders)
          </li>
          <li>
            <strong style={{ color: "red" }}>✗ FAIL:</strong> Focus skips shadow DOM elements
          </li>
          <li>Focus should cycle through ALL elements (regular + shadow DOM) without escaping</li>
        </ol>

        <button {...api().getTriggerProps()} data-testid="trigger">
          Open Dialog
        </button>

        <Portal ref={setShadowRef} useShadow mount={mountRef}>
          <style innerHTML={styles} />
          <Show when={api().open}>
            <Portal mount={getRootNode()?.getElementById("portal-root")!}>
              <div {...api().getBackdropProps()} />
              <div {...api().getPositionerProps()} data-testid="positioner">
                <div {...api().getContentProps()}>
                  <h2 {...api().getTitleProps()}>Dialog with Shadow DOM</h2>
                  <p {...api().getDescriptionProps()}>
                    This dialog's content is rendered in a shadow DOM. Focus should be trapped within all elements.
                  </p>

                  <button {...api().getCloseTriggerProps()} data-testid="close">
                    Close (X)
                  </button>

                  <div style={{ "margin-top": "16px" }}>
                    <p>Elements in shadow DOM:</p>
                    <input
                      type="text"
                      placeholder="Shadow input 1"
                      data-testid="shadow-input-1"
                      style={{ border: "2px solid blue", padding: "8px", margin: "4px 0", width: "100%" }}
                    />
                    <button
                      data-testid="shadow-button-1"
                      style={{ border: "2px solid blue", padding: "8px", margin: "4px 0" }}
                    >
                      Shadow Button 1
                    </button>

                    <input
                      type="text"
                      placeholder="Shadow input 2"
                      data-testid="shadow-input-2"
                      style={{ border: "2px solid green", padding: "8px", margin: "4px 0", width: "100%" }}
                    />
                    <button
                      data-testid="shadow-button-2"
                      style={{ border: "2px solid green", padding: "8px", margin: "4px 0" }}
                    >
                      Shadow Button 2
                    </button>
                  </div>

                  <div style={{ "margin-top": "16px" }}>
                    <button data-testid="save-button">Save Changes</button>
                  </div>
                </div>
              </div>
            </Portal>
          </Show>
          <div id="portal-root" />
        </Portal>
      </div>
    </main>
  )
}
