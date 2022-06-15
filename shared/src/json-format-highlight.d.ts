declare module "json-format-highlight" {
  export type FormatOptions = {
    keyColor?: string
    numberColor?: string
    stringColor?: string
    trueColor?: string
    falseColor?: string
    nullColor?: string
  }
  export default function formatHighlight(code: string, options?: Options): string
}
