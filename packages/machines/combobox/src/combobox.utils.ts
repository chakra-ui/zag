import { dom } from "./combobox.dom"
import type { MachineContext as Ctx } from "./combobox.types"

export const utils = {
  labelFromValue: (ctx: Ctx, value: string) => {
    const el = dom.getMatchingOptionEl(ctx, value)
    const data = dom.getOptionData(el)
    return data.label
  },
}
