const screens = import.meta.glob<{ mount: (root: HTMLElement) => void }>("./screens/*.{ts,tsx}")
const params = new URLSearchParams(location.search)
const screen = params.get("screen") ?? "react-zag"
const load = screens[`./screens/${screen}.tsx`] ?? screens[`./screens/${screen}.ts`]

// Created before any component, so the agent hears every one as it starts.
// Each library's screen gets its own bridge, with its own tool descriptions.
if (params.has("agent")) {
  if (screen.includes("ui-sdk")) {
    const { agentTools, createAgent } = await import("@ui-sdk/react/agent")
    Object.assign(window, { __agent: createAgent(), __agentTools: agentTools })
  } else {
    const { agentTools, allComponents, createAgent, registerTools } = await import("@zag-js/agent")
    Object.assign(window, {
      __agent: createAgent({ components: allComponents }),
      __agentTools: agentTools,
      // For the checks: registers the tools with a stand-in for the browser's own agent.
      __registerTools: registerTools,
    })
  }
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
