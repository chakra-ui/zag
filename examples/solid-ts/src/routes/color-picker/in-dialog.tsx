import * as colorPicker from "@zag-js/color-picker"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { type ParentProps, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/color-picker.css"
import "@styles/dialog.css"

const ColorPicker = () => {
  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    name: "color",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
  })

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>Select Color</label>
      <div {...api().getControlProps()}>
        <input {...api().getHiddenInputProps()} />
        <button {...api().getTriggerProps()}>
          <div style={{ position: "relative" }}>
            <div {...api().getTransparencyGridProps({ size: "4px" })} />
            <div {...api().getSwatchProps({ value: api().value })} />
          </div>
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div class="content__inner">
                <div {...api().getAreaProps()}>
                  <div {...api().getAreaBackgroundProps()} />
                  <div {...api().getAreaThumbProps()} />
                </div>

                <div {...api().getChannelSliderProps({ channel: "hue" })}>
                  <div {...api().getChannelSliderTrackProps({ channel: "hue" })} />
                  <div {...api().getChannelSliderThumbProps({ channel: "hue" })} />
                </div>

                <div {...api().getChannelSliderProps({ channel: "alpha" })}>
                  <div {...api().getTransparencyGridProps({ size: "12px" })} />
                  <div {...api().getChannelSliderTrackProps({ channel: "alpha" })} />
                  <div {...api().getChannelSliderThumbProps({ channel: "alpha" })} />
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

function Dialog(props: ParentProps<{ title?: string }>) {
  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>Open Dialog</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div style={{ padding: "24px", "min-width": "400px" }}>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    "margin-bottom": "16px",
                  }}
                >
                  <h2 {...api().getTitleProps()}>{props.title || "Color Picker Dialog"}</h2>
                  <button {...api().getCloseTriggerProps()}>
                    <XIcon />
                  </button>
                </div>
                <div {...api().getDescriptionProps()} style={{ "margin-bottom": "24px" }}>
                  This dialog contains a color picker. The issue was that interacting with the color picker would close
                  the dialog.
                </div>
                {props.children}
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Color Picker in Dialog Test</h1>
      <p>
        This page tests the portalled color picker inside a portalled dialog issue. Before the fix, clicking on the
        color picker would close the dialog.
      </p>

      <div style={{ "margin-top": "20px" }}>
        <Dialog title="Primary Color Selection">
          <div style={{ "margin-bottom": "16px" }}>
            <ColorPicker />
          </div>
        </Dialog>
      </div>
    </main>
  )
}
