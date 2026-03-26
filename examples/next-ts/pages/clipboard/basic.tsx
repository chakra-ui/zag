import styles from "../../../../shared/src/css/clipboard.module.css"
import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { clipboardControls } from "@zag-js/shared"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(clipboardControls)

  const service = useMachine(clipboard.machine, {
    id: useId(),
    value: "https://github.com/chakra-ui/zag",
    ...controls.context,
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <>
      <main className="clipboard">
        <div {...api.getRootProps()} className={styles.Root}>
          <label {...api.getLabelProps()}>Copy this link</label>
          <div {...api.getControlProps()} className={styles.Control}>
            <input {...api.getInputProps()} className={styles.Input} />
            <button {...api.getTriggerProps()} className={styles.Trigger}>{api.copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}</button>
          </div>
          <div {...api.getIndicatorProps({ copied: true })} className={styles.Indicator}>Copied!</div>
          <div {...api.getIndicatorProps({ copied: false })} className={styles.Indicator}>Copy</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
