import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const ListboxAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={430} y={115} width={596} height={610} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <text x={470} y={180} fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        Choose a framework
      </text>
      <rect x={470} y={240} width={516} height={360} rx={8} fill={palette[4]} />
      <rect x={495} y={270} width={466} height={85} rx={6} fill={palette[7]} />
      <text x={530} y={325} fill={palette[0]} fontSize={40} fontFamily="sans-serif">
        React
      </text>
      <path d="m875 310 12 12 23-25" stroke={palette[0]} strokeWidth={5} />
      <text x={530} y={435} fill={palette[0]} fontSize={40} fontFamily="sans-serif">
        Vue
      </text>
      <text x={530} y={545} fill={palette[0]} fontSize={40} fontFamily="sans-serif">
        Solid
      </text>
      <AnatomyLabel palette={palette} x={728} y={65} points="728,85 728,115" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={220} y={170} points="305,170 470,170">
        label
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1090} y={490} points="986,490 1070,490">
        content
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1090} y={310} points="910,310 1070,310">
        item indicator
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={220} y={355} points="305,355 495,355">
        item
      </AnatomyLabel>
    </svg>
  )
})
