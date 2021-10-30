import type { StateMachine as S } from "@ui-machines/core"
import { Context } from "../utils"

export type RangeSliderMachineContext = Context<{
  "aria-label"?: string | string[]
  "aria-labelledby"?: string | string[]
  thumbSize: Array<{ width: number; height: number }> | null
  name?: string[]
  threshold: number
  activeIndex: number
  value: number[]
  disabled?: boolean
  onChange?(value: number[]): void
  onChangeStart?(value: number[]): void
  onChangeEnd?(value: number[]): void
  getAriaValueText?(value: number, index: number): string
  min: number
  max: number
  step: number
  minStepsBetweenThumbs: number
  orientation: "vertical" | "horizontal"
  readonly isVertical: boolean
  readonly isHorizontal: boolean
  readonly isRtl: boolean
}>

export type RangeSliderMachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}

export type RangeSliderState = S.State<RangeSliderMachineContext, RangeSliderMachineState>

export type RangeSliderSend = S.Send<S.AnyEventObject>
