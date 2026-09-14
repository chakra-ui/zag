import { createComponent } from "../create-component"

export const WheelPickerAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={350} y={70} width={756} height={672} rx={16} fill={palette[4]} />
      <rect x={410} y={158} width={636} height={524} rx={12} fill={palette[5]} />
      <rect
        x={450}
        y={194}
        width={556}
        height={452}
        rx={8}
        fill={palette[3]}
        stroke={palette[9]}
        strokeDasharray="10 10"
      />

      <text x={450} y={130} fill={palette[0]} fontFamily="sans-serif" fontSize={28} fontWeight={600}>
        Framework
      </text>

      <g fill={palette[0]} fontFamily="sans-serif" fontSize={24} textAnchor="middle">
        <text x={728} y={264}>
          React
        </text>
        <text x={728} y={330}>
          Vue
        </text>
        <text x={728} y={396}>
          Svelte
        </text>
        <text x={728} y={462}>
          Solid
        </text>
        <text x={728} y={528}>
          Preact
        </text>
        <text x={728} y={594}>
          Qwik
        </text>
      </g>

      <rect x={450} y={382} width={556} height={64} rx={6} fill={palette[7]} />
      <text
        x={728}
        y={423}
        fill={palette[0]}
        fontFamily="sans-serif"
        fontSize={26}
        fontWeight={700}
        textAnchor="middle"
      >
        Svelte
      </text>

      <g stroke={palette[1]} strokeWidth={3}>
        <path d="M350 96H224" />
        <path d="M450 118H224" />
        <path d="M410 220H224" />
        <path d="M450 290H224" />
        <path d="M1006 238H1232" />
        <path d="M1006 322H1232" />
        <path d="M1006 414H1232" />
        <path d="M1006 500H1232" />
        <path d="M1006 584H1232" />
      </g>

      <g fill={palette[0]} fontFamily="sans-serif" fontSize={20}>
        <text x={88} y={103}>
          Root
        </text>
        <text x={88} y={125}>
          Label
        </text>
        <text x={88} y={227}>
          Control
        </text>
        <text x={88} y={297}>
          Viewport
        </text>
        <text x={1248} y={245}>
          Item group
        </text>
        <text x={1248} y={329}>
          Item
        </text>
        <text x={1248} y={421}>
          Highlight
        </text>
        <text x={1248} y={507}>
          Highlight item group
        </text>
        <text x={1248} y={591}>
          Highlight item
        </text>
      </g>
    </svg>
  )
})
