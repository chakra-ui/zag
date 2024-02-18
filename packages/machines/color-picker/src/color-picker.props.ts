import { createProps } from "@zag-js/types"
import type {
  AreaProps,
  ChannelProps,
  SwatchProps,
  SwatchTriggerProps,
  TransparencyGridProps,
  UserDefinedContext,
} from "./color-picker.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnSelect",
  "dir",
  "disabled",
  "format",
  "getRootNode",
  "id",
  "ids",
  "initialFocusEl",
  "name",
  "name",
  "onFocusOutside",
  "onFormatChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "onValueChangeEnd",
  "open.controlled",
  "open",
  "positioning",
  "readOnly",
  "value",
])

export const areaProps = createProps<AreaProps>()(["xChannel", "yChannel"])

export const channelProps = createProps<ChannelProps>()(["channel", "orientation"])

export const swatchTriggerProps = createProps<SwatchTriggerProps>()(["value", "disabled"])

export const swatchProps = createProps<SwatchProps>()(["value", "respectAlpha"])

export const transparencyGridProps = createProps<TransparencyGridProps>()(["size"])
