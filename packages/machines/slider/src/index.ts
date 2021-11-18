import { sliderConnect } from "./slider.connect"
import { sliderMachine } from "./slider.machine"
import { dom } from "./slider.dom"

export const slider = {
  machine: sliderMachine,
  connect: sliderConnect,
  dom,
}

export type { SliderMachineContext, SliderMachineState } from "./slider.types"
