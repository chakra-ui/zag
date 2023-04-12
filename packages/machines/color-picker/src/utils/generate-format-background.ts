export const generateRGB_R = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,0),rgb(${zValue},255,0))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,255),rgb(${zValue},255,255))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
  return result
}

export const generateRGB_G = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},0),rgb(255,${zValue},0))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},255),rgb(255,${zValue},255))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
  return result
}

export const generateRGB_B = (orientation: [string, string], dir: boolean, zValue: number) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,0,${zValue}),rgb(255,0,${zValue}))`,
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,255,${zValue}),rgb(255,255,${zValue}))`,
      WebkitMaskImage: maskImage,
      maskImage,
    },
  }
  return result
}

export const generateHSL_H = (orientation: [string, string], dir: boolean, zValue: number) => {
  const result = {
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
  return result
}

export const generateHSL_S = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  const result = {
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
  return result
}

export const generateHSL_L = (orientation: [string, string], dir: boolean, zValue: number) => {
  const result = {
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
  return result
}

export const generateHSB_H = (orientation: [string, string], dir: boolean, zValue: number) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
        `hsl(${zValue}, 100%, 50%)`,
      ].join(","),
    },
  }
  return result
}

export const generateHSB_S = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  const result = {
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
  return result
}

export const generateHSB_B = (orientation: [string, string], dir: boolean, alphaValue: number) => {
  const result = {
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
  return result
}
