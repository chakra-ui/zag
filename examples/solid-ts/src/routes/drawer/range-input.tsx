import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { drawerControls } from "@zag-js/shared"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import styles from "../../../../shared/styles/drawer.module.css"

export default function Page() {
  const controls = useControls(drawerControls)
  const [volume, setVolume] = createSignal(50)

  const service = useMachine(
    drawer.machine,
    controls.mergeProps({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <button {...api().getTriggerProps()} class={styles.trigger}>
          Open
        </button>
        <Presence {...api().getBackdropProps()} class={styles.backdrop} />
        <div {...api().getPositionerProps()} class={styles.positioner}>
          <Presence {...api().getContentProps()} class={styles.content}>
            <div {...api().getGrabberProps()} class={styles.grabber}>
              <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
            </div>
            <div {...api().getTitleProps()}>Drawer + native range</div>
            <p
              {...api().getDescriptionProps()}
              style={{ padding: "0 16px", margin: "8px 0 0", "font-size": "14px", color: "#555" }}
            >
              Drag the slider horizontally. The sheet should not move or steal the gesture while adjusting the range.
            </p>
            <div style={{ padding: "16px", width: "100%", "box-sizing": "border-box" }}>
              <label for="drawer-range-demo" style={{ display: "block", "margin-bottom": "8px", "font-size": "14px" }}>
                Volume (native <code style={{ "font-size": "12px" }}>&lt;input type=&quot;range&quot;&gt;</code>)
              </label>
              <input
                id="drawer-range-demo"
                type="range"
                min={0}
                max={100}
                value={volume()}
                onInput={(e) => setVolume(Number(e.currentTarget.value))}
                data-testid="drawer-native-range"
                style={{ width: "100%", "touch-action": "auto" }}
              />
              <output
                style={{
                  display: "block",
                  "margin-top": "8px",
                  "font-size": "14px",
                  "font-variant-numeric": "tabular-nums",
                }}
              >
                {volume()}
              </output>
            </div>
            <div class={styles.scrollable} data-testid="scrollable">
              <For each={Array.from({ length: 40 })}>
                {(_element, index) => <div style={{ padding: "4px 16px" }}>Item {index()}</div>}
              </For>
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
      </Toolbar>
    </>
  )
}
