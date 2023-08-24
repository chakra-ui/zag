import { AccordionAnatomy } from "./accordion"
import { AvatarAnatomy } from "./avatar"
import { CheckboxAnatomy } from "./checkbox"
import { ComboboxAnatomy } from "./combobox"
import { DialogAnatomy } from "./dialog"
import { EditableAnatomy } from "./editable"
import { FileUploadAnatomy } from "./file-upload"
import { HoverCardAnatomy } from "./hover-card"
import { MenuAnatomy } from "./menu"
import { NumberInputAnatomy } from "./number-input"
import { PaginationAnatomy } from "./pagination"
import { PinInputAnatomy } from "./pin-input"
import { PopoverAnatomy } from "./popover"
import { RatingGroupAnatomy } from "./rating-group"
import { SegmentedControlAnatomy } from "./segmented-control"
import { SelectAnatomy } from "./select"
import { SliderAnatomy } from "./slider"
import { SplitterAnatomy } from "./splitter"
import { SwitchAnatomy } from "./switch"
import { TabsAnatomy } from "./tabs"
import { TagsInputAnatomy } from "./tags-input"
import { ToastAnatomy } from "./toast"
import { TooltipAnatomy } from "./tooltip"
import { ToggleGroupAnatomy } from "./toggle-group"

export const allComponents = {
  "toggle-group": ToggleGroupAnatomy,
  "file-upload": FileUploadAnatomy,
  accordion: AccordionAnatomy,
  avatar: AvatarAnatomy,
  checkbox: CheckboxAnatomy,
  combobox: ComboboxAnatomy,
  dialog: DialogAnatomy,
  editable: EditableAnatomy,
  "hover-card": HoverCardAnatomy,
  pagination: PaginationAnatomy,
  "pin-input": PinInputAnatomy,
  popover: PopoverAnatomy,
  menu: MenuAnatomy,
  "number-input": NumberInputAnatomy,
  "rating-group": RatingGroupAnatomy,
  "segmented-control": SegmentedControlAnatomy,
  slider: SliderAnatomy,
  "tags-input": TagsInputAnatomy,
  tooltip: TooltipAnatomy,
  toast: ToastAnatomy,
  splitter: SplitterAnatomy,
  select: SelectAnatomy,
  switch: SwitchAnatomy,
  tabs: TabsAnatomy,
}

export type ComponentAnatomyName = keyof typeof allComponents

export function getComponent(name: ComponentAnatomyName) {
  return allComponents[name]
}
