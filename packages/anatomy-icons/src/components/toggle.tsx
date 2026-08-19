import { createComponent } from "../create-component"

/** Single toggle: aligned with toggle-group item sizing (174×174) and canvas center (641, 319). */
export const ToggleAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      {/* Root — same footprint as one toggle-group item */}
      <rect width={174} height={174} transform="translate(641 319)" rx={12} fill={palette[5]} />
      {/* Indicator — inset content area */}
      <rect x={659} y={337} width={138} height={138} rx={10} fill={palette[4]} />
      {/* Bold icon — path from toggle-group, shifted to this column (641 vs 467 → +174 on x) */}
      <path
        d="M701 379H755V385H701V379ZM713 415H743V421H713V415ZM713 391H743V397H713V391ZM701 403H755V409H701V403ZM701 427H755V433H701V427Z"
        fill={palette[0]}
      />
      {/* Outer dashed frame — same padding pattern as toggle-group per-item bounds */}
      <rect
        x={618.36}
        y={296.36}
        width={219.28}
        height={219.28}
        rx={14.36}
        stroke={palette[9]}
        strokeWidth={2.72}
        strokeDasharray="10.88 10.88"
        fill="none"
      />
      <path d="M 400 406 L 641 406" stroke={palette[1]} strokeWidth={4} strokeLinecap="round" />
      <path d="M 797 406 L 1080 406" stroke={palette[1]} strokeWidth={4} strokeLinecap="round" />
      <text
        x={280}
        y={406}
        fill={palette[0]}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={28}
        fontWeight={600}
        dominantBaseline="middle"
      >
        root
      </text>
      <text
        x={1200}
        y={406}
        fill={palette[0]}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={28}
        fontWeight={600}
        textAnchor="end"
        dominantBaseline="middle"
      >
        indicator
      </text>
    </svg>
  )
})
