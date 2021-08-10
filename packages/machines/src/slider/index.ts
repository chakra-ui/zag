import { connectSliderMachine } from "./slider.connect"
import { sliderMachine } from "./slider.machine"

export const slider = {
  machine: sliderMachine,
  connect: connectSliderMachine,
}

export type { SliderMachineContext, SliderMachineState } from "./slider.machine"
