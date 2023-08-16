import { chakra } from "@chakra-ui/system"
import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type SwitchProps = {
  controls: {
    disabled: boolean
    readOnly: boolean
  }
}

export function Switch(props: SwitchProps) {
  const [state, send] = useMachine(zagSwitch.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = zagSwitch.connect(state, send, normalizeProps)

  return (
    <div>
      <chakra.label
        {...api.rootProps}
        display="flex"
        alignItems="center"
        position="relative"
        lineHeight={0}
        width="fit-content"
        sx={{
          "--switch-track-diff":
            "calc(var(--switch-track-width) - var(--switch-track-height))",
          "--switch-thumb-x": "var(--switch-track-diff)",
          "--switch-track-width": "2.7rem",
          "--switch-track-height": "1.5rem",
        }}
      >
        <input {...api.hiddenInputProps} />
        <chakra.span
          {...api.controlProps}
          display="inline-flex"
          flexShrink="0"
          justifyContent="flex-start"
          boxSizing="content-box"
          cursor="pointer"
          borderRadius="9999px"
          padding="0.125rem"
          width="var(--switch-track-width)"
          height="var(--switch-track-height)"
          transitionProperty="background-color, border-color, color, fill, stroke, opacity, box-shadow, transform"
          transitionDuration="150ms"
          background="var(--switch-bg)"
          sx={{
            "--switch-bg": "#cbd5e0",
            WebkitBoxPack: "start",
            "&[data-state=checked]": {
              "--switch-bg": "#2AB26B",
            },
            _focus: {
              boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
            },
            _disabled: {
              opacity: "0.4",
              cursor: "not-allowed",
            },
          }}
        >
          <chakra.span
            {...api.thumbProps}
            background="white"
            transitionProperty="transform"
            transitionDuration="200ms"
            borderRadius="inherit"
            width="var(--switch-track-height)"
            height="var(--switch-track-height)"
            position="relative"
            _before={{
              transition: "background-color 0.2s ease-in-out",
              position: "absolute",
              "--thumb-size": "calc(var(--switch-track-height) + 0.7rem)",
              height: "var(--thumb-size)",
              width: "var(--thumb-size)",
              backgroundColor: "transparent",
              content: '""',
              zIndex: 1,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "inherit",
            }}
            sx={{
              "&[data-state=checked]": {
                transform: "translateX(var(--switch-thumb-x))",
              },
            }}
          />
        </chakra.span>
        <chakra.span
          {...api.labelProps}
          userSelect="none"
          marginInlineStart="0.5rem"
        >
          {api.isChecked ? "On" : "Off"}
        </chakra.span>
      </chakra.label>
    </div>
  )
}
