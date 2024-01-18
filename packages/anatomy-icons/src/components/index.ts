import { AccordionAnatomy } from "./accordion"
import { AvatarAnatomy } from "./avatar"
import { CarouselAnatomy } from "./carousel"
import { CheckboxAnatomy } from "./checkbox"
import { CircularProgressAnatomy } from "./circular-progress"
import { ColorPickerAnatomy } from "./color-picker"
import { ComboboxAnatomy } from "./combobox"
import { DatePickerAnatomy } from "./date-picker"
import { DialogAnatomy } from "./dialog"
import { EditableAnatomy } from "./editable"
import { FileUploadAnatomy } from "./file-upload"
import { HoverCardAnatomy } from "./hover-card"
import { LinearProgressAnatomy } from "./linear-progress"
import { MenuAnatomy } from "./menu"
import { NumberInputAnatomy } from "./number-input"
import { PaginationAnatomy } from "./pagination"
import { PinInputAnatomy } from "./pin-input"
import { PopoverAnatomy } from "./popover"
import { RadioGroupAnatomy } from "./radio-group"
import { RatingGroupAnatomy } from "./rating-group"
import { SegmentedControlAnatomy } from "./segmented-control"
import { SelectAnatomy } from "./select"
import { SliderAnatomy } from "./slider"
import { SplitterAnatomy } from "./splitter"
import { SwitchAnatomy } from "./switch"
import { TabsAnatomy } from "./tabs"
import { TagsInputAnatomy } from "./tags-input"
import { ToastAnatomy } from "./toast"
import { ToggleGroupAnatomy } from "./toggle-group"
import { TooltipAnatomy } from "./tooltip"

export const allComponents = {
  "circular-progress": CircularProgressAnatomy,
  "color-picker": ColorPickerAnatomy,
  "date-picker": DatePickerAnatomy,
  "file-upload": FileUploadAnatomy,
  "hover-card": HoverCardAnatomy,
  "linear-progress": LinearProgressAnatomy,
  "number-input": NumberInputAnatomy,
  "pin-input": PinInputAnatomy,
  "radio-group": RadioGroupAnatomy,
  "rating-group": RatingGroupAnatomy,
  "segmented-control": SegmentedControlAnatomy,
  "tags-input": TagsInputAnatomy,
  "toggle-group": ToggleGroupAnatomy,
  accordion: AccordionAnatomy,
  avatar: AvatarAnatomy,
  carousel: CarouselAnatomy,
  checkbox: CheckboxAnatomy,
  combobox: ComboboxAnatomy,
  dialog: DialogAnatomy,
  editable: EditableAnatomy,
  menu: MenuAnatomy,
  pagination: PaginationAnatomy,
  popover: PopoverAnatomy,
  select: SelectAnatomy,
  slider: SliderAnatomy,
  splitter: SplitterAnatomy,
  switch: SwitchAnatomy,
  tabs: TabsAnatomy,
  toast: ToastAnatomy,
  tooltip: TooltipAnatomy,
}

export type ComponentAnatomyName = keyof typeof allComponents

export function getComponent(name: ComponentAnatomyName) {
  return allComponents[name]
}
