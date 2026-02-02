import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/slider.module.css"

interface SliderProps extends Omit<slider.Props, "id"> {}

export function Slider(props: SliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    min: -50,
    max: 50,
    defaultValue: [20],
    ...props,
    thumbAlignment: "center",
    thumbSize: { width: 20, height: 20 },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div>
        <label className={styles.Label} {...api.getLabelProps()}>
          Quantity
        </label>
        <output className={styles.ValueText} {...api.getValueTextProps()}>
          <b>{api.value.at(0)}</b>
        </output>
      </div>

      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.Track} {...api.getTrackProps()}>
          <div className={styles.Range} {...api.getRangeProps()} />
        </div>
        {api.value.map((_, index) => (
          <div
            className={styles.Thumb}
            key={index}
            {...api.getThumbProps({ index })}
          >
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
    </div>
  )
}
