import styles from "../../../../shared/src/css/angle-slider.module.css"
import * as angleSlider from "@zag-js/angle-slider"
import { useMachine, normalizeProps } from "@zag-js/react"
import { angleSliderControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(angleSliderControls)

  const service = useMachine(angleSlider.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <>
      <main className="angle-slider">
        <div {...api.getRootProps()} className={styles.Root}>
          <label {...api.getLabelProps()} className={styles.Label}>
            Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
          </label>
          <div {...api.getControlProps()} className={styles.Control}>
            <div {...api.getThumbProps()} className={styles.Thumb}></div>
            <div {...api.getMarkerGroupProps()} className={styles.MarkerGroup}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((value) => (
                <div key={value} {...api.getMarkerProps({ value })} className={styles.Marker}></div>
              ))}
            </div>
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
