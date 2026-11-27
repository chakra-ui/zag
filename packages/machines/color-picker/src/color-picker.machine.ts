import { parseColor, toGamut, type Color } from "@zag-js/utils/color"
import { createGuards, createMachine, type Params, type Scope, type Transition, type TransitionMap } from "@zag-js/core"
import { getDismissReason, trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  disableTextSelection,
  contains,
  dispatchInputValueEvent,
  getInitialFocus,
  isFocusOutside,
  setElementValue,
  trackFormControl,
} from "@zag-js/dom-query"
import { trackDrag } from "@zag-js/dom-query/drag"
import { getPlacement, type Placement } from "@zag-js/popper"
import type { Orientation } from "@zag-js/types"
import { tryCatch } from "@zag-js/utils/functions"
import * as dom from "./color-picker.dom"
import { parse } from "./color-picker.parse"
import type {
  ColorChannel,
  ColorFormat,
  ColorPickerSchema,
  ExtendedColorChannel,
  OpenChangeReason,
  Platform,
} from "./color-picker.types"
import { getChannelValue } from "./utils/get-channel-input-value"
import { prefixHex } from "./utils/is-valid-hex"

const { and } = createGuards<ColorPickerSchema>()

const hashObject = (obj: Record<string, number>): string => {
  let hash = ""
  for (const key in obj) hash += `${key}:${obj[key] ?? ""};`
  return hash
}

const DEFAULT_COLOR = parse("#000000")

const OPEN: Transition<ColorPickerSchema>[] = [
  { guard: "isOpenControlled", actions: ["invokeOnOpen"] },
  { target: "open", actions: ["invokeOnOpen", "setInitialFocus"] },
]

const OPEN_ON: TransitionMap<ColorPickerSchema> = {
  "CONTROLLED.OPEN": { target: "open", actions: ["setInitialFocus"] },
  OPEN,
  "TRIGGER.CLICK": OPEN,
}

export const machine = createMachine<ColorPickerSchema>({
  props({ props }) {
    const color = props.value ?? props.defaultValue ?? DEFAULT_COLOR
    return {
      dir: "ltr",
      locale: "en-US",
      defaultValue: DEFAULT_COLOR,
      defaultFormat: color.getFormat(),
      openAutoFocus: true,
      ...props,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen") || prop("inline")
    return open ? "open" : "idle"
  },

  refs() {
    return {
      focusFrame: AnimationFrame.create(),
      inputSyncFrame: AnimationFrame.create(),
      formatSyncFrame: AnimationFrame.create(),
      channelDraft: null,
    }
  },

  context({ prop, bindable, getContext }) {
    return {
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
      value: bindable<Color>(() => ({
        defaultValue: fitGamut(prop, prop("defaultValue").toFormat(prop("format") ?? prop("defaultFormat"))),
        value: prop("value")?.toFormat(prop("format") ?? prop("defaultFormat")),
        isEqual(a, b) {
          return b != null && a.isEqual(b)
        },
        hash(a) {
          return hashObject(a.toJSON())
        },
        onChange(value) {
          const ctx = getContext()
          const format = ctx.get("format")
          // Pass value as-is to preserve channel info (e.g., HSB saturation at black)
          // valueAsString is converted to the desired format for display
          prop("onValueChange")?.({ value, valueAsString: value.toString(format) })
        },
      })),
      format: bindable<ColorFormat>(() => ({
        defaultValue: prop("defaultFormat"),
        value: prop("format"),
        onChange(format) {
          prop("onFormatChange")?.({ format })
        },
      })),
      activeId: bindable<string | null>(() => ({ defaultValue: null })),
      activeChannel: bindable<any>(() => ({ defaultValue: null })),
      activeOrientation: bindable<Orientation | null>(() => ({ defaultValue: null })),
      editedColor: bindable<Color | null>(() => ({ defaultValue: null })),
      areaDragPosition: bindable<{ x: number; y: number } | null>(() => ({ defaultValue: null })),
      sliderDragPercent: bindable<number | null>(() => ({ defaultValue: null })),
      fieldsetDisabled: bindable<boolean>(() => ({ defaultValue: false })),
      restoreFocus: bindable<boolean>(() => ({ defaultValue: true })),
      platform: bindable<Platform>(() => ({ defaultValue: { supportsEyeDropper: false } })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  computed: {
    rtl: ({ prop }) => prop("dir") === "rtl",
    disabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    valueAsString: ({ context }) => context.get("value").toString(context.get("format")),
    areaValue: ({ context }) => {
      const value = context.get("value")
      const format = context.get("format")
      const editedColor = context.get("editedColor")
      if (editedColor?.toFormat(format).isEqual(value)) return editedColor
      // The area is drawn in HSL for HSL colors, and in HSB for every other format
      return value.toFormat(format.startsWith("hsl") ? "hsla" : "hsba")
    },
  },

  effects: ["trackFormControl", "detectPlatform"],

  entry: ["syncFormatSelectElement"],

  exit: ["cancelFrames"],

  watch({ prop, context, action, track }) {
    track([() => context.hash("value")], () => {
      action(["syncInputElements", "dispatchChangeEvent"])
    })

    track([() => context.get("format")], () => {
      action(["syncFormatSelectElement", "syncValueWithFormat"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "FORMAT.SET": {
      actions: ["setFormat"],
    },
    "CHANNEL_INPUT.CHANGE": {
      actions: ["setChannelColorFromInput"],
    },
    "EYEDROPPER.CLICK": {
      actions: ["openEyeDropper"],
    },
    "SWATCH_TRIGGER.CLICK": {
      actions: ["setValue", "invokeOnChangeEnd"],
    },
  },

  states: {
    idle: {
      tags: ["closed"],
      on: {
        ...OPEN_ON,
        "CHANNEL_INPUT.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"],
        },
      },
    },

    focused: {
      id: "color-picker-focused",
      tags: ["closed", "focused"],
      on: {
        ...OPEN_ON,
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"],
        },
        "CHANNEL_INPUT.BLUR": {
          target: "idle",
          actions: ["setChannelColorFromInput"],
        },
        "TRIGGER.BLUR": {
          target: "idle",
        },
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackPositioning", "trackDismissableElement"],
      // Its inputs can unmount without a blur
      exit: ["clearContentChannelDraft"],
      initial: "idle",
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["setReturnFocus"],
          },
          {
            target: "idle",
          },
        ],
        INTERACT_OUTSIDE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["invokeOnClose", "setReturnFocus"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
      },
      states: {
        idle: {
          on: {
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "#color-picker-focused",
                actions: ["invokeOnClose"],
              },
            ],
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setActiveChannel", "setColorFromPoint", "focusThumb"],
            },
            "AREA.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "CHANNEL_SLIDER.FOCUS": {
              actions: ["setActiveChannel"],
            },
            "CHANNEL.STEP": {
              actions: ["stepChannel", "invokeOnChangeEnd"],
            },
            "CHANNEL_INPUT.BLUR": {
              actions: ["setChannelColorFromInput"],
            },
            "SWATCH_TRIGGER.CLICK": [
              {
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["setValue", "invokeOnChangeEnd", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["setValue", "invokeOnChangeEnd", "invokeOnClose", "setReturnFocus"],
              },
              {
                actions: ["setValue", "invokeOnChangeEnd"],
              },
            ],
          },
        },
        dragging: {
          tags: ["dragging"],
          exit: ["clearActiveChannel"],
          effects: ["trackDrag", "disableTextSelection"],
          on: {
            POINTER_MOVE: {
              actions: ["setColorFromPoint", "focusThumb"],
            },
            POINTER_UP: {
              target: "idle",
              actions: ["invokeOnChangeEnd"],
            },
          },
        },
      },
    },
  },

  implementations: {
    guards: {
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null || !!prop("inline"),
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
    },
    effects: {
      trackPositioning({ context, prop, scope }) {
        if (prop("inline")) return

        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning")?.placement)
        }

        const anchorEl = dom.getTriggerEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(anchorEl, getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      trackDismissableElement({ context, scope, prop, send }) {
        if (prop("inline")) return

        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "popover",
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          exclude: dom.getTriggerEl(scope),
          defer: true,
          getRootNode: scope.getRootNode,
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            context.set("restoreFocus", !(event.detail.focusable || event.detail.contextmenu))
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onFocusOutside: prop("onFocusOutside"),
          onDismiss(event) {
            send({ type: "INTERACT_OUTSIDE", src: getDismissReason(event), focusVisible: event?.type === "keydown" })
          },
        })
      },
      detectPlatform({ context, scope }) {
        context.set("platform", { supportsEyeDropper: "EyeDropper" in scope.getWin() })
      },
      trackFormControl({ context, scope, send }) {
        const inputEl = dom.getHiddenInputEl(scope)
        return trackFormControl(inputEl, {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            send({ type: "VALUE.SET", value: context.initial("value"), src: "form.reset" })
          },
        })
      },
      trackDrag({ scope, event, send }) {
        return trackDrag(scope.getDoc(), {
          startPoint: event.point,
          pointerId: event.pointerId,
          onMove({ point }) {
            send({ type: "POINTER_MOVE", point, format: event.format })
          },
          onEnd() {
            send({ type: "POINTER_UP" })
          },
        })
      },
      disableTextSelection({ scope }) {
        return disableTextSelection({
          doc: scope.getDoc(),
          target: dom.getContentEl(scope),
        })
      },
    },
    actions: {
      openEyeDropper({ scope, context, prop }) {
        const win = scope.getWin()
        const isSupported = "EyeDropper" in win
        if (!isSupported) return
        const picker = new win.EyeDropper()
        picker
          .open()
          .then(({ sRGBHex }) => {
            const format = context.get("value").getFormat()
            const color = parseColor(sRGBHex).toFormat(format) as Color
            context.set("value", color)
            return color
          })
          .then((value) => {
            prop("onValueChangeEnd")?.({
              value,
              valueAsString: value.toString(context.get("format")),
            })
          })
          .catch(() => void 0)
      },
      setActiveChannel({ context, event }) {
        context.set("activeId", event.id)
        if (event.channel) context.set("activeChannel", event.channel)
        if (event.orientation) context.set("activeOrientation", event.orientation)
      },
      clearActiveChannel({ context }) {
        context.set("activeChannel", null)
        context.set("activeId", null)
        context.set("activeOrientation", null)
        context.set("areaDragPosition", null)
        context.set("sliderDragPercent", null)
      },
      setColorFromPoint(params) {
        const { context, event, scope, prop } = params
        const id = context.get("activeId")
        const dir = prop("dir")

        if (id === "area") {
          const { xChannel, yChannel } = context.get("activeChannel")!
          const percent = dom.getAreaValueFromPoint(scope, event.point, dir)
          if (!percent) return
          context.set("areaDragPosition", percent)
          editColor(params, event.format, (color) =>
            color
              .withChannelValue(xChannel!, color.getChannelPercentValue(xChannel!, percent.x))
              .withChannelValue(yChannel!, color.getChannelPercentValue(yChannel!, 1 - percent.y)),
          )
          return
        }

        const channel = id as ColorChannel
        const percent = dom.getChannelSliderValueFromPoint(scope, event.point, channel, dir)
        if (!percent) return
        const sliderPercent = context.get("activeOrientation") === "vertical" ? percent.y : percent.x
        context.set("sliderDragPercent", sliderPercent)
        editColor(params, event.format, (color) =>
          color.withChannelValue(channel, color.getChannelPercentValue(channel, sliderPercent)),
        )
      },
      setValue({ context, event, prop }) {
        const format = context.get("format")
        context.set("value", fitGamut(prop, event.value.toFormat(format)))
      },
      setFormat({ context, event }) {
        context.set("format", event.format)
      },
      dispatchChangeEvent({ scope, computed }) {
        dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: computed("valueAsString") })
      },
      clearContentChannelDraft({ refs, scope }) {
        const draft = refs.get("channelDraft")
        if (draft && contains(dom.getContentEl(scope), draft.el)) refs.set("channelDraft", null)
      },
      syncInputElements({ context, scope, refs }) {
        syncChannelInputs(refs, scope, context.get("value"))
      },
      invokeOnChangeEnd({ context, prop, computed }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsString: computed("valueAsString"),
        })
      },
      setChannelColorFromInput({ context, event, scope, prop, refs }) {
        const { channel, isTextField, value } = event
        const current = context.get("value")
        const format = context.get("format")
        const alpha = current.getChannelValue("alpha")

        let color: Color
        if (channel === "alpha") {
          const n = parseFloat(value)
          color = current.withChannelValue("alpha", Number.isNaN(n) ? alpha : n)
        } else if (isTextField) {
          color = tryCatch(
            () =>
              parse(channel === "hex" ? prefixHex(value) : value)
                .withChannelValue("alpha", alpha)
                .toFormat(format),
            () => current,
          )
        } else {
          const inFormat = current.toFormat(format)
          color = Number.isNaN(value) ? inFormat : inFormat.withChannelValue(channel, value)
        }

        color = fitGamut(prop, color)
        syncChannelInputs(refs, scope, current, color)
        context.set("value", color)
        prop("onValueChangeEnd")?.({ value: color, valueAsString: color.toString(format) })
      },
      stepChannel(params) {
        const { channel, format, step, bound } = params.event
        editColor(params, format, (color) => {
          if (!bound) return color.incrementChannel(channel, step)
          const { minValue, maxValue } = color.getChannelRange(channel)
          return color.withChannelValue(channel, bound === "min" ? minValue : maxValue)
        })
      },
      focusThumb({ context, scope, refs }) {
        const id = context.get("activeId")
        refs.get("focusFrame").request(() => {
          const el = id === "area" ? dom.getAreaThumbEl(scope) : dom.getChannelSliderThumbEl(scope, id as ColorChannel)
          el?.focus({ preventScroll: true })
        })
      },
      setInitialFocus({ prop, scope, refs }) {
        if (!prop("openAutoFocus")) return
        refs.get("focusFrame").request(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          if (!element) return
          element.focus({ preventScroll: true })
        })
      },
      setReturnFocus({ scope, event, refs }) {
        const contentEl = dom.getContentEl(scope)
        const focusOptions = getReturnFocusOptions(event)
        refs.get("focusFrame").request(() => {
          // Keep focus that moved elsewhere (e.g. from `onValueChange`)
          if (isFocusOutside(scope.getActiveElement(), [contentEl])) return
          dom.getTriggerEl(scope)?.focus(focusOptions)
        })
      },
      syncFormatSelectElement({ context, scope, refs }) {
        syncFormatSelect(refs.get("formatSyncFrame"), scope, context.get("format"))
      },
      cancelFrames({ refs }) {
        refs.get("focusFrame").cancel()
        refs.get("inputSyncFrame").cancel()
        refs.get("formatSyncFrame").cancel()
      },
      syncValueWithFormat({ context }) {
        const value = context.get("value")
        const newValue = value.toFormat(context.get("format"))
        if (newValue.isEqual(value)) return
        context.set("value", newValue)
      },
      invokeOnOpen({ prop, context, event }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: true, value: context.get("value"), reason: getOpenChangeReason(event) })
      },
      invokeOnClose({ prop, context, event }) {
        if (prop("inline")) return
        prop("onOpenChange")?.({ open: false, value: context.get("value"), reason: getOpenChangeReason(event) })
      },
      toggleVisibility({ prop, event, send }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})

function syncChannelInputs(
  refs: Params<ColorPickerSchema>["refs"],
  scope: Scope,
  currentValue: Color,
  nextValue?: Color,
) {
  const channelInputEls = dom.getChannelInputEls(scope)
  refs.get("inputSyncFrame").request(() => {
    const draftChannel = refs.get("channelDraft")?.channel
    channelInputEls.forEach((inputEl) => {
      const channel = inputEl.dataset.channel as ExtendedColorChannel | null
      if (channel === draftChannel) return
      setElementValue(inputEl, getChannelValue(nextValue || currentValue, channel))
    })
  })
}

function syncFormatSelect(frame: AnimationFrame, scope: Scope, format: ColorFormat) {
  const selectEl = dom.getFormatSelectEl(scope)
  if (!selectEl) return
  frame.request(() => setElementValue(selectEl, format))
}

function getOpenChangeReason(event: Params<ColorPickerSchema>["event"]) {
  return event.src as OpenChangeReason | undefined
}

// Show the focus ring when closed from the keyboard; leave it to the browser otherwise
function getReturnFocusOptions(event: Record<string, any>): FocusOptions {
  const focusVisible = event.focusVisible ?? event.previousEvent?.focusVisible
  return focusVisible ? { preventScroll: true, focusVisible: true } : { preventScroll: true }
}

function fitGamut(prop: Params<ColorPickerSchema>["prop"], color: Color) {
  const gamut = prop("gamut")
  return gamut ? toGamut(color, gamut) : color
}

function editColor(
  { context, computed, prop }: Pick<Params<ColorPickerSchema>, "context" | "computed" | "prop">,
  format: ColorFormat | undefined,
  edit: (color: Color) => Color,
) {
  const color = format ? context.get("value").toFormat(format) : computed("areaValue")
  const next = edit(color)
  context.set("editedColor", next)
  context.set("value", fitGamut(prop, next.toFormat(context.get("format"))))
}
