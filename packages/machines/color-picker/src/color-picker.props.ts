import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type {
  AreaProps,
  ChannelProps,
  SwatchProps,
  SwatchTriggerProps,
  TransparencyGridProps,
  ColorPickerProps,
} from "./color-picker.types"

export const props = createProps<ColorPickerProps>()([
  "closeOnSelect",
  "dir",
  "disabled",
  "format",
  "defaultFormat",
  "getRootNode",
  "id",
  "ids",
  "initialFocusEl",
  "inline",
  "name",
  "positioning",
  "onFocusOutside",
  "onFormatChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "onValueChangeEnd",
  "defaultOpen",
  "open",
  "positioning",
  "required",
  "readOnly",
  "value",
  "defaultValue",
  "invalid",
  "openAutoFocus",
])

export const splitProps = createSplitProps<Partial<ColorPickerProps>>(props)

export const areaProps = createProps<AreaProps>()(["xChannel", "yChannel"])
export const splitAreaProps = createSplitProps<AreaProps>(areaProps)

export const channelProps = createProps<ChannelProps>()(["channel", "orientation"])
export const splitChannelProps = createSplitProps<ChannelProps>(channelProps)

export const swatchTriggerProps = createProps<SwatchTriggerProps>()(["value", "disabled"])
export const splitSwatchTriggerProps = createSplitProps<SwatchTriggerProps>(swatchTriggerProps)

export const swatchProps = createProps<SwatchProps>()(["value", "respectAlpha"])
export const splitSwatchProps = createSplitProps<SwatchProps>(swatchProps)

export const transparencyGridProps = createProps<TransparencyGridProps>()(["size"])
export const splitTransparencyGridProps = createSplitProps<TransparencyGridProps>(transparencyGridProps)
