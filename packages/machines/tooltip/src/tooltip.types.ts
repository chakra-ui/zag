export type TooltipMachineContext = {
  doc?: Document
  id: string
  disabled?: boolean
  openDelay: number
  closeDelay: number
  closeOnPointerDown: boolean
}

export type TooltipMachineState = {
  value: "unknown" | "opening" | "open" | "closing" | "closed"
}
