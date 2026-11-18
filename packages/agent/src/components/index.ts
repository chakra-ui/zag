import { accordionAgent } from "./accordion"
import { checkboxAgent } from "./checkbox"
import { dialogAgent } from "./dialog"
import { menuAgent } from "./menu"
import { selectAgent } from "./select"
import type { AgentDescriptor } from "./shared"
import { switchAgent } from "./switch"
import { tabsAgent } from "./tabs"

export { accordionAgent, checkboxAgent, dialogAgent, menuAgent, selectAgent, switchAgent, tabsAgent }
export { defineAgentComponent } from "./shared"
export type { ActionContext, AgentDescriptor, AgentItem, Expected } from "./shared"

/** Every component the bridge ships a description for. Pass only the ones a page uses to bundle less. */
export const allComponents: AgentDescriptor[] = [
  tabsAgent,
  accordionAgent,
  selectAgent,
  switchAgent,
  checkboxAgent,
  menuAgent,
  dialogAgent,
]
