export const semanticTokens = {
  colors: {
    "bg-subtle": {
      value: { base: "{colors.white}", _dark: "{colors.gray.800}" },
    },
    "bg-bold": {
      value: { base: "{colors.gray.100}", _dark: "{colors.gray.700}" },
    },
    "bg-primary-subtle": { value: { base: "{colors.green.500}" } },
    "bg-primary-bold": {
      value: { base: "{colors.green.600}", _dark: "{colors.green.400}" },
    },
    "bg-secondary-subtle": { value: { base: "{colors.black}" } },
    "bg-secondary-bold": {
      value: { base: "{colors.gray.700}", _dark: "{colors.gray.900}" },
    },
    "bg-tertiary-bold": {
      value: { base: "{colors.green.100}", _dark: "{colors.green.900}" },
    },
    "bg-tertiary-subtle": {
      value: { base: "{colors.green.50}", _dark: "{colors.green.900}" },
    },

    "bg-code-block": {
      value: { base: "hsl(230, 1%, 98%)", _dark: "{colors.gray.900}" },
    },
    "bg-code-inline": {
      value: {
        base: "{colors.blackAlpha.100}",
        _dark: "{colors.whiteAlpha.100}",
      },
    },
    "bg-header": {
      value: {
        base: "{colors.whiteAlpha.900}",
        _dark: "{colors.rgba(26, 32, 44, 0.92)}",
      },
    },
    "bg-badge": {
      value: { base: "{colors.orange.100}", _dark: "{colors.orange.900}" },
    },

    "text-bold": {
      value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" },
    },
    "text-subtle": {
      value: { base: "{colors.gray.600}", _dark: "{colors.gray.400}" },
    },
    "text-primary-bold": { value: { base: "{colors.green.500}" } },
    "text-primary-subtle": {
      value: { base: "{colors.green.600}", _dark: "{colors.green.400}" },
    },
    "text-badge": {
      value: { base: "{colors.orange.700}", _dark: "{colors.orange.300}" },
    },

    "border-subtle": {
      value: { base: "{colors.gray.100}", _dark: "{colors.gray.700}" },
    },
    "border-bold": {
      value: { base: "{colors.gray.200}", _dark: "{colors.gray.700}" },
    },
    "border-primary-subtle": { value: { base: "{colors.green.500}" } },
    "border-primary-bold": {
      value: { base: "{colors.green.600}", _dark: "{colors.green.400}" },
    },
  },
}
