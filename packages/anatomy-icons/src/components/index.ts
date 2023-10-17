import { MenuAnatomy } from "./menu"
import { DialogAnatomy } from "./dialog"
import { PopoverAnatomy } from "./popover"
import { SliderAnatomy } from "./slider"
import { PinInputAnatomy } from "./pin-input"
import { NumberInputAnatomy } from "./number-input"
import { TagsInputAnatomy } from "./tags-input"
import { TooltipAnatomy } from "./tooltip"
import { SplitterAnatomy } from "./splitter"
import { ComboboxAnatomy } from "./combobox"
import { TabsAnatomy } from "./tabs"
import { EditableAnatomy } from "./editable"
import { AccordionAnatomy } from "./accordion"
import { ToastAnatomy } from "./toast"
import { CheckboxAnatomy } from "./checkbox"
import { SelectAnatomy } from "./select"
import { HoverCardAnatomy } from "./hover-card"
import { PaginationAnatomy } from "./pagination"
import { RatingAnatomy } from "./rating"
import { SwitchAnatomy } from "./switch"
import { SegmentedControlAnatomy } from "./segmented-control"
import { AvatarAnatomy } from "./avatar"
import { RadioGroupAnatomy } from "./radio-group"
import { FileUploadAnatomy } from "./file-upload"
import { ToggleGroupAnatomy } from "./toggle-group"
import { CarouselAnatomy } from "./carousel"
import { ColorPickerAnatomy } from "./color-picker"
import { DatePickerAnatomy } from "./date-picker"

export const allComponents = {
  "date-picker": DatePickerAnatomy,
  "color-picker": ColorPickerAnatomy,
  carousel: CarouselAnatomy,
  "toggle-group": ToggleGroupAnatomy,
  "file-upload": FileUploadAnatomy,
  "radio-group": RadioGroupAnatomy,
  avatar: AvatarAnatomy,
  "segmented-control": SegmentedControlAnatomy,
  switch: SwitchAnatomy,
  rating: RatingAnatomy,
  pagination: PaginationAnatomy,
  "hover-card": HoverCardAnatomy,
  select: SelectAnatomy,
  checkbox: CheckboxAnatomy,
  toast: ToastAnatomy,
  accordion: AccordionAnatomy,
  editable: EditableAnatomy,
  tabs: TabsAnatomy,
  combobox: ComboboxAnatomy,
  splitter: SplitterAnatomy,
  tooltip: TooltipAnatomy,
  "tags-input": TagsInputAnatomy,
  "number-input": NumberInputAnatomy,
  "pin-input": PinInputAnatomy,
  slider: SliderAnatomy,
  popover: PopoverAnatomy,
  dialog: DialogAnatomy,
  menu: MenuAnatomy,
}

export type ComponentAnatomyName = keyof typeof allComponents

export function getComponent(name: ComponentAnatomyName) {
  return allComponents[name]
}
