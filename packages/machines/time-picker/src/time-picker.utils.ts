import type { MachineContext } from "./time-picker.types"

export function getFormatedValue(ctx: MachineContext) {
  const { hour, minute } = ctx.value
  const hourString = hour < 10 ? `0${hour}` : hour
  const minuteString = minute < 10 ? `0${minute}` : minute
  const period = ctx.period ? ctx.period.toUpperCase() : ""
  return `${hourString}:${minuteString} ${period}`
}
