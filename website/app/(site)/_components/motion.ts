export const ease = {
  out: "cubic-bezier(0.23, 1, 0.32, 1)",
  inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const

export const duration = {
  press: 100,
  close: 120,
  hop: 160,
  open: 180,
  swap: 240,
  fade: 300,
} as const

export const rest = {
  short: 900,
  base: 1400,
  long: 2200,
} as const

export const hopGap = 240

export const resumeAfter = 4000

export const swapBlur = "blur(4px)"
