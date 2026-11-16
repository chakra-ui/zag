const screens = import.meta.glob<{ mount: (root: HTMLElement) => void }>("./screens/*.{ts,tsx}")
const params = new URLSearchParams(location.search)
const screen = params.get("screen") ?? "react-zag"
const load = screens[`./screens/${screen}.tsx`] ?? screens[`./screens/${screen}.ts`]

// Created before any component, so the agent hears every one as it starts.
// Each library's screen gets its own bridge, with its own tool descriptions.
if (params.has("agent")) {
  const { agentTools, createAgent } = screen.includes("ui-sdk")
    ? await import("@ui-sdk/react/agent")
    : await import("@zag-js/agent")
  Object.assign(window, { __agent: createAgent(), __agentTools: agentTools })
}

const label = params.get("label")
if (label) {
  const banner = document.createElement("div")
  banner.className = "banner"
  // Hidden from the accessibility tree, so no agent reads which run it is in.
  banner.setAttribute("aria-hidden", "true")
  banner.textContent = label
  document.body.prepend(banner)
}

const root = document.getElementById("root")!
if (load) {
  const { mount } = await load()
  mount(root)
  document.body.dataset.mounted = ""
} else {
  root.textContent = `No screen named ${screen}. Screens: ${Object.keys(screens)
    .map((file) => file.replace(/^.*\/|\.tsx?$/g, ""))
    .join(", ")}.`
}
