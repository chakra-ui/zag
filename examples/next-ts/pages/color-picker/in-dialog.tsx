import * as colorPicker from "@zag-js/color-picker"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId } from "react"

const ColorPicker = () => {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Select Color</label>
      <div {...api.getControlProps()}>
        <input {...api.getHiddenInputProps()} />
        <button {...api.getTriggerProps()}>
          <div style={{ position: "relative" }}>
            <div {...api.getTransparencyGridProps({ size: "4px" })} />
            <div {...api.getSwatchProps({ value: api.value })} />
          </div>
        </button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div className="content__inner">
              <div {...api.getAreaProps()}>
                <div {...api.getAreaBackgroundProps()} />
                <div {...api.getAreaThumbProps()} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "hue" })}>
                <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
                <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                <div {...api.getTransparencyGridProps({ size: "12px" })} />
                <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} />
                <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}

function Dialog(props: React.PropsWithChildren<{ title?: string }>) {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div style={{ padding: "24px", minWidth: "400px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h2 {...api.getTitleProps()}>{props.title || "Color Picker Dialog"}</h2>
                  <button {...api.getCloseTriggerProps()}>
                    <XIcon />
                  </button>
                </div>
                <div {...api.getDescriptionProps()} style={{ marginBottom: "24px" }}>
                  This dialog contains a color picker. The issue was that interacting with the color picker would close
                  the dialog.
                </div>
                {props.children}
              </div>
            </div>
          </div>
        </Portal>
      )}
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

      <div style={{ marginTop: "20px" }}>
        <Dialog title="Primary Color Selection">
          <div style={{ marginBottom: "16px" }}>
            <ColorPicker />
          </div>
        </Dialog>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Dialog title="Nested Dialog Test">
          <div style={{ marginBottom: "16px" }}>
            <p>First color picker:</p>
            <ColorPicker />
          </div>

          <div style={{ marginTop: "16px" }}>
            <Dialog title="Nested Color Picker">
              <ColorPicker />
            </Dialog>
          </div>
        </Dialog>
      </div>
    </main>
  )
}
