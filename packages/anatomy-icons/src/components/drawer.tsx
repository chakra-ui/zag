import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const DrawerAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={350} y={175} width={756} height={545} rx={8} fill={palette[3]} />
      <rect x={440} y={205} width={250} height={65} rx={8} fill={palette[7]} />
      <text x={565} y={248} textAnchor="middle" fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Open drawer
      </text>
      <rect x={410} y={400} width={636} height={260} rx={12} fill={palette[4]} />
      <rect x={673} y={427} width={110} height={10} rx={5} fill={palette[9]} />
      <text x={450} y={510} fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        Add a contact
      </text>
      <text x={450} y={555} fill={palette[9]} fontSize={26} fontFamily="sans-serif">
        Save someone to your address book.
      </text>
      <rect x={960} y={475} width={50} height={50} rx={6} fill={palette[7]} />
      <path d="m975 490 20 20m0-20-20 20" stroke={palette[0]} strokeWidth={4} />
      <rect x={450} y={590} width={485} height={35} rx={6} fill={palette[5]} />
      <AnatomyLabel palette={palette} x={170} y={235} points="290,235 440,235">
        trigger
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={728} y={335} points="728,360 728,427" align="middle">
        grabber
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={170} y={500} points="260,500 450,500">
        title
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={110} y={550} points="290,550 450,550">
        description
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={500} points="1010,500 1120,500">
        close trigger
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={630} points="1046,630 1120,630">
        content
      </AnatomyLabel>
    </svg>
  )
})
