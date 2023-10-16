import type { ChannelProps, Color, MachineContext } from "../color-picker.types"

function getSliderBackgroundDirection(orientation: "vertical" | "horizontal", dir: "ltr" | "rtl") {
  if (orientation === "vertical") {
    return "top"
  } else if (dir === "ltr") {
    return "right"
  } else {
    return "left"
  }
}

interface SliderBackgroundProps extends Required<ChannelProps> {
  value: Color
  dir: MachineContext["dir"]
}

export const getSliderBackground = (props: SliderBackgroundProps) => {
  const { channel, value, dir } = props
  const bgDirection = getSliderBackgroundDirection(props.orientation, dir!)
  const { minValue, maxValue } = value.getChannelRange(channel)

  switch (channel) {
    case "hue":
      return `linear-gradient(to ${bgDirection}, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)`
    case "lightness": {
      let start = value.withChannelValue(channel, minValue).toString("css")
      let middle = value.withChannelValue(channel, (maxValue - minValue) / 2).toString("css")
      let end = value.withChannelValue(channel, maxValue).toString("css")
      return `linear-gradient(to ${bgDirection}, ${start}, ${middle}, ${end})`
    }
    case "saturation":
    case "brightness":
    case "red":
    case "green":
    case "blue":
    case "alpha": {
      let start = value.withChannelValue(channel, minValue).toString("css")
      let end = value.withChannelValue(channel, maxValue).toString("css")
      return `linear-gradient(to ${bgDirection}, ${start}, ${end})`
    }
    default:
      throw new Error("Unknown color channel: " + channel)
  }
}
