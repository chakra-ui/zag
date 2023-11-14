import { Divider, Flex, Stack, VStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as colorPicker from "@zag-js/color-picker"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type Props = {
  controls: {
    disabled: boolean
    readOnly: boolean
    closeOnSelect: boolean
  }
}

const presets = ["#f47373", "#697689", "#38a169", "#3182ce"]

const Show = (props: { when: boolean; children: React.ReactNode }) => {
  const { when, children } = props
  return when ? <>{children}</> : null
}

const EyeDropIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"></path>
  </svg>
)

const Swatch = chakra("div", {
  baseStyle: {
    width: "5",
    height: "5",
    flexShrink: "0",
  },
})

const TransparentGrid = chakra("div", {
  baseStyle: {
    borderRadius: "4px",
  },
})

const ChannelInput = chakra("input", {
  baseStyle: {
    borderRadius: "4px",
    width: "100%",
    borderWidth: "1px",
    paddingX: "2",
    bg: "bg-subtle",
    fontSize: "sm",
    minHeight: "32px",
  },
})

const SliderTrack = chakra("div", {
  baseStyle: {
    height: "3",
    rounded: "4px",
  },
})

const Thumb = chakra("div", {
  baseStyle: {
    border: "2px solid white",
    borderRadius: "full",
    transform: "translate(-50%, -50%)",
    shadow: "black 0px 0px 0px 1px, black 0px 0px 0px 1px inset",
    width: "4",
    height: "4",
  },
})

const ChannelLabel = chakra("span", {
  baseStyle: {
    fontSize: "sm",
    fontWeight: "medium",
  },
})

const EyeDropButton = chakra("button", {
  baseStyle: {
    width: "40px",
    height: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1px",
  },
})

export function ColorPicker(props: Props) {
  const [state, send] = useMachine(
    colorPicker.machine({
      id: useId(),
      value: colorPicker.parse("#38a169"),
    }),
    {
      context: props.controls,
    },
  )

  const api = colorPicker.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <chakra.label
        fontSize="sm"
        display="block"
        mb="2"
        _disabled={{ opacity: "0.6" }}
        {...api.labelProps}
      >
        <span>
          <chakra.span fontWeight="medium">Color</chakra.span>:{" "}
          {api.valueAsString}
        </span>
      </chakra.label>

      <chakra.div
        display="flex"
        alignItems="flex-start"
        gap="2"
        {...api.controlProps}
      >
        <Flex
          align="center"
          justify="center"
          p="1"
          bg="bg-subtle"
          borderWidth="1px"
        >
          <chakra.button bg="bg-subtle" {...api.triggerProps}>
            <TransparentGrid
              {...api.getTransparencyGridProps({ size: "10px" })}
            />
            <Swatch {...api.getSwatchProps({ value: api.value })} />
          </chakra.button>
        </Flex>
        <ChannelInput {...api.getChannelInputProps({ channel: "hex" })} />
        <ChannelInput
          maxWidth="64px"
          {...api.getChannelInputProps({ channel: "alpha" })}
        />
      </chakra.div>

      <Portal>
        <div {...api.positionerProps}>
          <chakra.div
            shadow="base"
            isolation="isolate"
            padding="4"
            bg="bg-subtle"
            {...api.contentProps}
          >
            <chakra.div display="flex" flexDir="column" gap="2">
              <chakra.div
                height="200px"
                rounded="4px"
                borderWidth="1px"
                {...api.getAreaProps()}
              >
                <chakra.div
                  height="inherit"
                  rounded="inherit"
                  {...api.getAreaBackgroundProps()}
                />
                <Thumb {...api.getAreaThumbProps()} />
              </chakra.div>

              <Flex gap="20px" my="2">
                <Stack flex="1">
                  <div {...api.getChannelSliderProps({ channel: "hue" })}>
                    <SliderTrack
                      {...api.getChannelSliderTrackProps({ channel: "hue" })}
                    />
                    <Thumb
                      {...api.getChannelSliderThumbProps({ channel: "hue" })}
                    />
                  </div>

                  <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                    <TransparentGrid
                      {...api.getTransparencyGridProps({ size: "12px" })}
                    />
                    <SliderTrack
                      {...api.getChannelSliderTrackProps({ channel: "alpha" })}
                    />
                    <Thumb
                      {...api.getChannelSliderThumbProps({ channel: "alpha" })}
                    />
                  </div>
                </Stack>
                <EyeDropButton {...api.eyeDropperTriggerProps}>
                  <EyeDropIcon />
                </EyeDropButton>
              </Flex>

              <Show when={api.format.startsWith("hsl")}>
                <Flex width="100%" gap="0.5">
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "hue" })}
                    />
                    <ChannelLabel>H</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <ChannelLabel>S</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "lightness" })}
                    />
                    <ChannelLabel>L</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <ChannelLabel>A</ChannelLabel>
                  </VStack>
                </Flex>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <Flex width="100%" gap="0.5">
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "red" })}
                    />
                    <ChannelLabel>R</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "green" })}
                    />
                    <ChannelLabel>G</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "blue" })}
                    />
                    <ChannelLabel>B</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <ChannelLabel>A</ChannelLabel>
                  </VStack>
                </Flex>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <Flex width="100%" gap="0.5">
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "hue" })}
                    />
                    <ChannelLabel>H</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "saturation" })}
                    />
                    <ChannelLabel>S</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "brightness" })}
                    />
                    <ChannelLabel>B</ChannelLabel>
                  </VStack>
                  <VStack>
                    <ChannelInput
                      {...api.getChannelInputProps({ channel: "alpha" })}
                    />
                    <ChannelLabel>A</ChannelLabel>
                  </VStack>
                </Flex>
              </Show>

              <Divider borderWidth="1px" />

              <div
                {...api.swatchGroupProps}
                style={{ display: "flex", gap: "10px" }}
              >
                <p>Swatches</p>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    {...api.getSwatchTriggerProps({ value: preset })}
                  >
                    <div style={{ position: "relative" }}>
                      <TransparentGrid
                        {...api.getTransparencyGridProps({ size: "4px" })}
                      />
                      <Swatch {...api.getSwatchProps({ value: preset })} />
                    </div>
                  </button>
                ))}
              </div>
            </chakra.div>
          </chakra.div>
        </div>
      </Portal>
    </div>
  )
}
