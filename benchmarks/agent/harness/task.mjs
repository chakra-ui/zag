import path from "node:path"

const toolPath = path.join(import.meta.dirname, "tool.mjs")

const task = `Task: in the project settings,
- rename the project to Atlas
- set the visibility to Internal
- make Priya Shah an admin
- remove Tom Becker from the project (confirm when asked)
- in the Email notifications, turn on Deploy failures and turn off Weekly digest. Leave the Slack notifications as they are.
Then save the settings.`

const system =
  "You operate a web app for the user through one command, run with the Bash tool. Do what the user's message asks and follow its rules exactly."

const browserTools = (port) => `Tools (browser tools):
- snapshot: the page's accessibility tree, with a ref like [ref=e10] on each element.
- click <ref>: clicks that element. Returns the new snapshot.
- type <ref> <text>: fills a text field with the text, replacing what's there. Quote text with spaces. Returns the new snapshot.
- press <key>: presses a key on whatever has focus, like Enter, Escape, ArrowDown, Home, End or Tab. Returns the new snapshot.
- done: finish.

Example: node ${toolPath} ${port} click e10`

const agentTools = (port, tools) => `Tools (the page's own tools). Each takes its input as one JSON argument:
${tools.map((tool) => `- ${tool.name}: ${tool.description} Input: ${JSON.stringify(tool.inputSchema)}`).join("\n")}
- done: finish.

Example: node ${toolPath} ${port} query '{"text":"Jane"}'`

function prompt({ port, tools }) {
  return `You are an agent operating a web app that is already open in a browser. Your job is a normal user task in that app.

${task}

Rules:
- Your only way to see or act on the app is this command, run with Bash: node ${toolPath} ${port} <tool> [args...]
- Do not read, search, list or change any files, do not run any other command, and do not look at source code. Only that one command, one tool per Bash call.
- Check that everything really has the right value before you save.
- When the task is done, or you give up, run the tool \`done\` exactly once.
- Your final message: succeeded or not, the number of tool calls you made, and anything that went wrong or was hard. Keep it under 120 words.

${tools ? agentTools(port, tools) : browserTools(port)}`
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// One save, with every value the task asked for and nothing else changed.
function isCorrect(saved) {
  if (saved.length !== 1) {
    return false
  }
  const [settings] = saved
  const roles = Object.fromEntries(settings.members.map((member) => [member.id, member.role]))
  const admins = ["ada-okafor", "priya-shah"]
  return (
    settings.name === "Atlas" &&
    settings.visibility === "internal" &&
    settings.members.length === 23 &&
    !("tom-becker" in roles) &&
    Object.entries(roles).every(([id, role]) => role === (admins.includes(id) ? "admin" : "member")) &&
    same(settings.email, {
      "deploy-failures": true,
      "weekly-digest": false,
      mentions: true,
    }) &&
    same(settings.slack, { "deploy-failures": true, "new-members": false })
  )
}

export { isCorrect, prompt, system, task, toolPath }
