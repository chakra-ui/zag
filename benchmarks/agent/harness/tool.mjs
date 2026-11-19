// The one command an agent runs: node tool.mjs <port> <tool> [args...]
const [port, tool, ...args] = process.argv.slice(2)
const response = await fetch(`http://127.0.0.1:${port}`, {
  method: "POST",
  headers: { authorization: `Bearer ${process.env.AGENT_BENCHMARK_TOKEN}` },
  body: JSON.stringify({ tool, args }),
})
console.log(await response.text())
