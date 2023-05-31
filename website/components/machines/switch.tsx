import { panda } from "styled-system/jsx"
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
      <panda.label
        {...api.rootProps}
        display="flex"
        alignItems="center"
        position="relative"
        lineHeight={0}
        width="fit-content"
        css={{
          "--switch-track-diff":
            "calc(var(--switch-track-width) - var(--switch-track-height))",
          "--switch-thumb-x": "var(--switch-track-diff)",
          "--switch-track-width": "2.7rem",
          "--switch-track-height": "1.5rem",
        }}
      >
        <input {...api.inputProps} />
        <panda.span
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
          css={{
            "--switch-bg": "#cbd5e0",
            WebkitBoxPack: "start",
            _checked: {
              "--switch-bg": "#2AB26B",
            },
            _focus: {
              boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
            },

            _disabled: {
              opacity: "0.4",
              cursor: "not-allowed",
            },
          }}
        >
          <panda.span
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
            _checked={{
              transform: "translateX(var(--switch-thumb-x))",
            }}
          />
        </panda.span>
        <panda.span
          {...api.labelProps}
          userSelect="none"
          marginInlineStart="0.5rem"
        >
          {api.isChecked ? "On" : "Off"}
        </panda.span>
      </panda.label>
    </div>
  )
}
