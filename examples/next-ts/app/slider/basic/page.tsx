"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/slider.css"

export default function Page() {
  const controls = useControls(sliderControls)

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "volume",
    defaultValue: [0],
    thumbSize: 20,
    ...controls.context,
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Volume</label>
          <output {...api.getValueTextProps()}>{api.value}</output>
          <div {...api.getControlProps()}>
            <div {...api.getTrackProps()}>
              <div {...api.getRangeProps()} />
            </div>
            {api.value.map((_, index) => (
              <div key={index} {...api.getThumbProps({ index })}>
                <input {...api.getHiddenInputProps({ index })} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
