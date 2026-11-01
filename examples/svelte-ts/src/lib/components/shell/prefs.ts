// Saved shell preferences live on <html> as `data-pg-*`, so CSS can apply them before the app hydrates

const prefs = {
  layout: { key: "zag-playground-layout", attr: "pgLayout", values: ["centered", "padded"] },
  inspector: { key: "zag-playground-inspector", attr: "pgInspector", values: ["shown", "hidden"] },
  dock: { key: "zag-playground-dock", attr: "pgDock", values: ["right", "bottom"] },
} as const

type Prefs = typeof prefs
export type PrefName = keyof Prefs
export type PrefValue<N extends PrefName> = Prefs[N]["values"][number]

/** Runs in <head> before first paint */
export const prefsScript = `(function(){try{var p=${JSON.stringify(prefs)};for(var n in p){var v=localStorage.getItem(p[n].key);if(v&&p[n].values.indexOf(v)>-1)document.documentElement.dataset[p[n].attr]=v}}catch(e){}})()`

export function readPref<N extends PrefName>(name: N): PrefValue<N> | null {
  const value = document.documentElement.dataset[prefs[name].attr]
  return (prefs[name].values as readonly string[]).includes(value ?? "") ? (value as PrefValue<N>) : null
}

export function writePref<N extends PrefName>(name: N, value: PrefValue<N>) {
  document.documentElement.dataset[prefs[name].attr] = value
  try {
    localStorage.setItem(prefs[name].key, value)
  } catch {}
}

/** Kept out of .svelte files: Vite's dependency scanner treats a literal script tag as a script block */
export const prefsHtml = `<script>${prefsScript}</script>`
