import { Context } from "@ui-machines/types"

export type MachineContext = Context<{
  max: number
  name?: string
  value: number
  hoveredValue: number
  readonly?: boolean
  disabled?: boolean
  allowHalf?: boolean
  autoFocus?: boolean
  getLabelText?(value: number): string
  onChange?: (value: number) => void
  readonly isInteractive: boolean
  readonly isHovering: boolean
}>

export type MachineState = {
  value: "unknown" | "idle" | "hover" | "focus"
}
