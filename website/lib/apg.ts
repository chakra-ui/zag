const base = "https://www.w3.org/WAI/ARIA/apg/patterns"

export const apgPatterns: Record<string, { label: string; url: string }> = {
  "@zag-js/accordion": { label: "accordion", url: `${base}/accordion/` },
  "@zag-js/carousel": { label: "carousel", url: `${base}/carousel/` },
  "@zag-js/checkbox": { label: "checkbox", url: `${base}/checkbox/` },
  "@zag-js/collapsible": { label: "disclosure", url: `${base}/disclosure/` },
  "@zag-js/combobox": { label: "combobox", url: `${base}/combobox/` },
  "@zag-js/dialog": { label: "modal dialog", url: `${base}/dialog-modal/` },
  "@zag-js/listbox": { label: "listbox", url: `${base}/listbox/` },
  "@zag-js/menu": { label: "menu button", url: `${base}/menu-button/` },
  "@zag-js/menubar": { label: "menubar", url: `${base}/menubar/` },
  "@zag-js/meter": { label: "meter", url: `${base}/meter/` },
  "@zag-js/number-input": { label: "spinbutton", url: `${base}/spinbutton/` },
  "@zag-js/radio-group": { label: "radio group", url: `${base}/radio/` },
  "@zag-js/slider": { label: "slider", url: `${base}/slider/` },
  "@zag-js/splitter": {
    label: "window splitter",
    url: `${base}/windowsplitter/`,
  },
  "@zag-js/switch": { label: "switch", url: `${base}/switch/` },
  "@zag-js/tabs": { label: "tabs", url: `${base}/tabs/` },
  "@zag-js/toggle": { label: "button", url: `${base}/button/` },
  "@zag-js/tooltip": { label: "tooltip", url: `${base}/tooltip/` },
  "@zag-js/tree-view": { label: "tree view", url: `${base}/treeview/` },
}
