import { sliderConnect } from "./slider.connect"
import { sliderMachine } from "./slider.machine"

export const slider = {
  machine: sliderMachine,
  connect: sliderConnect,
}

export type { SliderMachineContext, SliderMachineState } from "./slider.machine"
