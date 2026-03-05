import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(clipboardControls)

  const service = useMachine(
    clipboard.machine,
    controls.mergeProps({
      id: createUniqueId(),
      value: "https://github.com/chakra-ui/zag",
    }),
  )

  const api = createMemo(() => clipboard.connect(service, normalizeProps))

  return (
    <>
      <main class="clipboard">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Copy this link</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} style={{ width: "100%" }} />
            <button {...api().getTriggerProps()}>
              <Show when={api().copied} fallback={<ClipboardCopyIcon />}>
                <ClipboardCheck />
              </Show>
            </button>
          </div>
          <div {...api().getIndicatorProps({ copied: true })}>Copied!</div>
          <div {...api().getIndicatorProps({ copied: false })}>Copy</div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
