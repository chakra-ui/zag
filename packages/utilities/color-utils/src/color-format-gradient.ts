export const generateRGB_R = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  return {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,0),rgb(${zValue},255,0))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,255),rgb(${zValue},255,255))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
}

export const generateRGB_G = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  return {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},0),rgb(255,${zValue},0))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},255),rgb(255,${zValue},255))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
}

export const generateRGB_B = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  return {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,0,${zValue}),rgb(255,0,${zValue}))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,255,${zValue}),rgb(255,255,${zValue}))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
}

export const generateHSL_H = (orientation: [string, string], dir: boolean, zValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${
          orientation[Number(dir)]
        }, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,50%),hsla(0,0%,50%,0))`,
        `hsl(${zValue}, 100%, 50%)`,
      ].join(","),
    },
  }
}

export const generateOKLAB_L = (orientation: [string, string], isAX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!isAX)]}, black, transparent)`
  const l = zValue === 0 ? "none" : `${(zValue * 100).toFixed(2)}%`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(isAX)]} in oklab, oklab(${l} -100% 100%), oklab(${l} 100% 100%))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(isAX)]} in oklab, oklab(${l} -100% -100%), oklab(${l} 100% -100%))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}
export const generateOKLAB_A = (orientation: [string, string], isLightnessX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(isLightnessX)]}, black, transparent)`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklab, oklab(1 ${zValue} -100%), oklab(1 ${zValue} 100%))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklab, oklab(0 ${zValue} -100%), oklab(0 ${zValue} 100%))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}
export const generateOKLAB_B = (orientation: [string, string], isLightnessX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(isLightnessX)]}, black, transparent)`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklab, oklab(1 -100% ${zValue}), oklab(1 100% ${zValue}))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklab, oklab(0 -100% ${zValue}), oklab(0 100% ${zValue}))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}

export const generateOKLCH_H = (orientation: [string, string], isChromaX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!isChromaX)]}, black, transparent)`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(isChromaX)]} in oklch, oklch(1 0% ${zValue}), oklch(1 100% ${zValue}))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(isChromaX)]} in oklch, oklch(0 0% ${zValue}), oklch(0 100% ${zValue}))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}

export const generateOKLCH_L = (orientation: [string, string], isChromaX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(isChromaX)]}, transparent, black)`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(!isChromaX)]} in oklch increasing hue, oklch(${zValue} 0% 0deg), oklch(${zValue} 0% 359.9eg))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(!isChromaX)]} in oklch increasing hue, oklch(${zValue} 100% 0deg), oklch(${zValue} 100% 359.9deg))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}

export const generateOKLCH_C = (orientation: [string, string], isLightnessX: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(isLightnessX)]}, transparent, black)`
  return {
    areaStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklch increasing hue, oklch(0 ${zValue} 0deg), oklch(0 ${zValue} 359.9deg))`,
    },
    areaGradientStyles: {
      background: `linear-gradient(to ${orientation[Number(!isLightnessX)]} in oklch increasing hue, oklch(1 ${zValue} 0deg), oklch(1 ${zValue} 359.9deg))`,
      maskImage,
      WebkitMaskImage: maskImage,
    },
  }
}

export const generateHSL_S = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${
          orientation[Number(!dir)]
        }, hsla(0,0%,0%,${alphaValue}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alphaValue}) 100%)`,
        `linear-gradient(to ${
          orientation[Number(dir)]
        },hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        "hsl(0, 0%, 50%)",
      ].join(","),
    },
  }
}

export const generateHSL_L = (orientation: [string, string], dir: boolean, zValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      backgroundImage: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,${zValue}%),hsla(0,0%,${zValue}%,0))`,
        `linear-gradient(to ${
          orientation[Number(dir)]
        },hsl(0,100%,${zValue}%),hsl(60,100%,${zValue}%),hsl(120,100%,${zValue}%),hsl(180,100%,${zValue}%),hsl(240,100%,${zValue}%),hsl(300,100%,${zValue}%),hsl(360,100%,${zValue}%))`,
      ].join(","),
    },
  }
}

export const generateHSB_H = (orientation: [string, string], dir: boolean, zValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
        `hsl(${zValue}, 100%, 50%)`,
      ].join(","),
    },
  }
}

export const generateHSB_S = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,0%,${alphaValue}),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${
          orientation[Number(dir)]
        },hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,0%),hsl(0,0%,100%))`,
      ].join(","),
    },
  }
}

export const generateHSB_B = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  return {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,100%,${alphaValue}),hsla(0,0%,100%,0))`,
        `linear-gradient(to ${
          orientation[Number(dir)]
        },hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        "#000",
      ].join(","),
    },
  }
}
