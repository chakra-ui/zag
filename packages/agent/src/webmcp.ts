import type { Agent, Allow } from "./agent"
import { agentTools } from "./tools"

interface ModelContext {
  registerTool: (tool: object, options: { signal: AbortSignal }) => Promise<void> | void
}

/**
 * Registers the agent's three tools with the browser's own agent through WebMCP,
 * `document.modelContext.registerTool`, where the browser has it, and does nothing where it doesn't.
 * Returns a function that unregisters them.
 *
 * You didn't write the browser's agent, so `allow` is required: it decides every step that agent asks
 * for, and again when the button a step presses is marked `data-agent-confirm`. When the bridge has an
 * `allow` of its own, a marked press needs both.
 *
 * @example
 * registerTools(agent, { allow: (step) => !step.confirm || confirm(step.confirm) })
 */
export function registerTools(agent: Agent, options: { allow: Allow }): VoidFunction {
  if (typeof options?.allow !== "function") {
    throw new Error("registerTools needs an `allow` that decides each step.")
  }
  const context = (globalThis.document as { modelContext?: ModelContext } | undefined)?.modelContext
  const controller = new AbortController()
  if (!context) return () => controller.abort()

  for (const tool of agentTools) {
    const execute = (input: any) => {
      if (tool.name === "act") return agent.act(input, { allow: options.allow })
      if (tool.name === "query") return agent.query(input)
      return agent.snapshot()
    }
    Promise.resolve(
      context.registerTool(
        {
          ...tool,
          // Labels and text come from the page, which can hold what its users wrote, and act can press any
          // button, like one that deletes.
          annotations: {
            readOnlyHint: tool.name !== "act",
            untrustedContentHint: true,
            consequentialHint: tool.name === "act",
          },
          execute,
        },
        { signal: controller.signal },
      ),
    ).catch((error: { name?: string }) => {
      // A permissions policy that turns WebMCP off, or unregistering before the browser finished, isn't a
      // mistake. A tool name already taken, like from a second call, is.
      if (error?.name !== "NotAllowedError" && error?.name !== "AbortError") {
        console.warn(`[@zag-js/agent] registerTools couldn't register ${tool.name}.`, error)
      }
    })
  }
  return () => controller.abort()
}
