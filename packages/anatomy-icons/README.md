# Anatomy Icons

## How do I add a new icon?

We first grab the svg from figma of course.

Zag's current default green palette is:

```js
const defaultPalette = {
  0: "white",
  1: "#2CFF80", //accentColor
  2: "#2C7A51",
  3: "#16402D",
  4: "#1C4D37",
  5: "#287753",
  6: "#1F8B56",
  7: "#2AB26B",
  8: "#1E6943",
  9: "#C1FFDF",
  10: "#41B883",
  11: "#299464",
  12: "#2AB36B",
  13: "#9FFFCD",
  14: "#0E432B",
}
```

We can find the colors in the svg code with this:

```js
function findColors(code) {
  const pattern = /"#.*?"/g
  const matches = code.match(pattern) || []
  return Array.from(new Set(matches.map((match) => match.slice(1, -1))))
}
```

We then check for the colors that are not yet defined in the palette with this:

```js
function findUndefinedColors(codeString) {
  const colors = findColors(codeString)
  return colors.filter((c) => !Object.values(defaultPalette).includes(c))
}
```

We add those colors to the palette.

We're able to find the relationship between the accentColor and it's accompanying palette with this tool
http://ethanmuller.github.io/sass-color-function-generator-thing/, so we use it to find the relationship for any new
colors we just added, then we define the relationship with `color2k` E.g.

```js
{
    14: darken(desaturate(adjustHue(this.accentColor, 9), 0.35), 0.43),
}
```

Lastly, to save time, you can replace the colors in your svg code with the dynamic relationships with this script:

```js
function replaceColors(code) {
  //We've defined this above
  const colors = findColors(code)

  const regex = new RegExp(
    colors
      .map((c) => `"${c}"`)
      .map((str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    "g",
  )

  return code
    .replace(regex, (c) => {
      const num = Object.entries(defaultPalette).find((cc) => `"${cc[1]}"` === c)
      return `{palette[${num?.[0]}]}`
    })
    .replaceAll(`"white"`, `{palette[0]}`)
}
```

The below shows the default template for the icon components.

```js
import { AnatomyIconColor } from "../anatomy-icon-color";
import type { AnatomyIconProps } from "../types";

export function Template_Anatomy(props: AnatomyIconProps) {
  const anc = new AnatomyIconColor(props);
  const palette = anc.getColorPalette();

  return ();
}
```
