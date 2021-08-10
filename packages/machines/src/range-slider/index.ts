import { connectRangeSliderMachine } from "./range-slider.connect"
import { rangeSliderMachine } from "./range-slider.machine"

export const rangeSlider = {
  machine: rangeSliderMachine,
  connect: connectRangeSliderMachine,
}

export type { RangeSliderMachineContext, RangeSliderMachineState } from "./range-slider.machine"
