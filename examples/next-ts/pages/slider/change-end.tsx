import styles from "../../../../shared/src/css/slider.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"

export default function Page() {
  const [value, setValue] = useState([50])
  const [endValue, setEndValue] = useState([50])

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quantity",
    onValueChange(details) {
      setValue(details.value)
    },
    onValueChangeEnd(details) {
      setEndValue(details.value)
    },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()} className={styles.Root}>
        <div {...api.getControlProps()} className={styles.Control}>
          <div data-testid="track" {...api.getTrackProps()} className={styles.Track}>
            <div {...api.getRangeProps()} className={styles.Range} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })} className={styles.Thumb}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          ))}
        </div>

        <div>
          <output>Change: {value[0]}</output>
          <output>Change end: {endValue[0]}</output>
        </div>
      </div>
    </main>
  )
}
