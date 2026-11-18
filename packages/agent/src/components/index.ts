import { accordionAgent } from "./accordion"
import { angleSliderAgent } from "./angle-slider"
import { carouselAgent } from "./carousel"
import { cascadeSelectAgent } from "./cascade-select"
import { checkboxAgent } from "./checkbox"
import { collapsibleAgent } from "./collapsible"
import { colorPickerAgent } from "./color-picker"
import { comboboxAgent } from "./combobox"
import { dateInputAgent } from "./date-input"
import { datePickerAgent } from "./date-picker"
import { dialogAgent } from "./dialog"
import { drawerAgent } from "./drawer"
import { editableAgent } from "./editable"
import { fileUploadAgent } from "./file-upload"
import { floatingPanelAgent } from "./floating-panel"
import { gridlistAgent } from "./gridlist"
import { hoverCardAgent } from "./hover-card"
import { listboxAgent } from "./listbox"
import { menuAgent } from "./menu"
import { navigationMenuAgent } from "./navigation-menu"
import { numberInputAgent } from "./number-input"
import { paginationAgent } from "./pagination"
import { passwordInputAgent } from "./password-input"
import { pinInputAgent } from "./pin-input"
import { popoverAgent } from "./popover"
import { radioGroupAgent } from "./radio-group"
import { ratingGroupAgent } from "./rating-group"
import { selectAgent } from "./select"
import { sliderAgent } from "./slider"
import { splitterAgent } from "./splitter"
import { stepsAgent } from "./steps"
import { switchAgent } from "./switch"
import { tabsAgent } from "./tabs"
import { tagsInputAgent } from "./tags-input"
import { timerAgent } from "./timer"
import { toastAgent } from "./toast"
import { toggleAgent } from "./toggle"
import { toggleGroupAgent } from "./toggle-group"
import { tooltipAgent } from "./tooltip"
import { tourAgent } from "./tour"
import { treeViewAgent } from "./tree-view"
import type { AgentDescriptor } from "./shared"

export {
  accordionAgent,
  angleSliderAgent,
  carouselAgent,
  cascadeSelectAgent,
  checkboxAgent,
  collapsibleAgent,
  colorPickerAgent,
  comboboxAgent,
  dateInputAgent,
  datePickerAgent,
  dialogAgent,
  drawerAgent,
  editableAgent,
  fileUploadAgent,
  floatingPanelAgent,
  gridlistAgent,
  hoverCardAgent,
  listboxAgent,
  menuAgent,
  navigationMenuAgent,
  numberInputAgent,
  paginationAgent,
  passwordInputAgent,
  pinInputAgent,
  popoverAgent,
  radioGroupAgent,
  ratingGroupAgent,
  selectAgent,
  sliderAgent,
  splitterAgent,
  stepsAgent,
  switchAgent,
  tabsAgent,
  tagsInputAgent,
  timerAgent,
  toastAgent,
  toggleAgent,
  toggleGroupAgent,
  tooltipAgent,
  tourAgent,
  treeViewAgent,
}
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
  angleSliderAgent,
  carouselAgent,
  cascadeSelectAgent,
  collapsibleAgent,
  colorPickerAgent,
  comboboxAgent,
  dateInputAgent,
  datePickerAgent,
  drawerAgent,
  editableAgent,
  fileUploadAgent,
  floatingPanelAgent,
  gridlistAgent,
  hoverCardAgent,
  listboxAgent,
  navigationMenuAgent,
  numberInputAgent,
  paginationAgent,
  passwordInputAgent,
  pinInputAgent,
  popoverAgent,
  radioGroupAgent,
  ratingGroupAgent,
  sliderAgent,
  splitterAgent,
  stepsAgent,
  tagsInputAgent,
  timerAgent,
  toastAgent,
  toggleAgent,
  toggleGroupAgent,
  tooltipAgent,
  tourAgent,
  treeViewAgent,
]
