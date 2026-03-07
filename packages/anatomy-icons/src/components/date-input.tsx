import { createComponent } from "../create-component"

export const DateInputAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      {/* root */}
      <rect x={156.5} y={211.5} width={1143} height={380} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />

      {/* label - large "Date" heading like password-input's "Password" */}
      <text
        x={205}
        y={333}
        fill={palette[0]}
        fontSize={64}
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Date
      </text>

      {/* control */}
      <rect x={200} y={358} width={1056} height={125} fill={palette[5]} stroke={palette[8]} strokeWidth={4} />

      {/* segment - month */}
      <rect x={216} y={366} width={190} height={109} rx={8} fill={palette[3]} />
      {/* segment - literal "/" */}
      <rect opacity={0.5} x={416} y={366} width={52} height={109} rx={8} fill={palette[3]} />
      {/* segment - day */}
      <rect x={478} y={366} width={190} height={109} rx={8} fill={palette[3]} />
      {/* segment - literal "/" */}
      <rect opacity={0.5} x={678} y={366} width={52} height={109} rx={8} fill={palette[3]} />
      {/* segment - year */}
      <rect x={740} y={366} width={280} height={109} rx={8} fill={palette[3]} />

      {/* segment content */}
      <text
        x={311}
        y={435}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={46}
        fontWeight={600}
        fontFamily="ui-monospace, monospace"
      >
        MM
      </text>
      <text x={442} y={432} fill={palette[0]} textAnchor="middle" fontSize={38} fontFamily="system-ui, sans-serif">
        /
      </text>
      <text
        x={573}
        y={435}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={46}
        fontWeight={600}
        fontFamily="ui-monospace, monospace"
      >
        DD
      </text>
      <text x={704} y={432} fill={palette[0]} textAnchor="middle" fontSize={38} fontFamily="system-ui, sans-serif">
        /
      </text>
      <text
        x={880}
        y={435}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={46}
        fontWeight={600}
        fontFamily="ui-monospace, monospace"
      >
        YYYY
      </text>

      {/* connector: label → label area */}
      <path d="M250 124V270" stroke={palette[1]} strokeWidth={4} />
      {/* connector: root → root top border */}
      <path d="M728 124V211" stroke={palette[1]} strokeWidth={4} />
      {/* connector: segmentGroup → segment area */}
      <path d="M1050 124V366" stroke={palette[1]} strokeWidth={4} />
      {/* connector: segment → segment bottom */}
      <path d="M311 475V636" stroke={palette[1]} strokeWidth={4} />
      {/* connector: control → control bottom */}
      <path d="M730 483V636" stroke={palette[1]} strokeWidth={4} />

      {/* annotation: label */}
      <text
        x={250}
        y={108}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={28}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        label
      </text>
      {/* annotation: root */}
      <text
        x={728}
        y={108}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={28}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        root
      </text>
      {/* annotation: segmentGroup */}
      <text
        x={1050}
        y={108}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={28}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        segmentGroup
      </text>
      {/* annotation: segment */}
      <text
        x={311}
        y={660}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={28}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        segment
      </text>
      {/* annotation: control */}
      <text
        x={730}
        y={660}
        fill={palette[0]}
        textAnchor="middle"
        fontSize={28}
        fontWeight={500}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        control
      </text>
    </svg>
  )
})
